# Adapted from the Spludo Framework.
# Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
#
# and from https://github.com/pkrumins/node-tree-kill
# 
# Licensed under the terms of MIT License. For the full copyright and license
# information, please see the LICENSE file in the root folder.

Child_process = require('child_process')
Fs = require 'fs'
Util = require 'util'
Path = require 'path'
File = require './file'
Chokidar = require 'chokidar'
_ = require '../general/chocodash' 
Chocokup = require '../general/chocokup' 
Debugate = require '../general/debugate' 

monitor_server = new class
    process: null
    compile_process: {}
    restarting: false
    appdir: null
    logging: yes
    config: null
    user: null

    "log": (msg) ->
        Debugate.log "Time:#{Date.now()}: " + msg if @logging

    "exit": ->
        this.log 'CHOCOLATEJS: terminate child process'
        this.kill(@process.pid) if @process?
        this.kill(@debug_process.pid) if @debug_process?
        check = =>
            # if child process exited we can also exit
            # otherwise we wait...
            unless @process? 
                this.log 'CHOCOLATEJS: exit'
                setTimeout (-> process.exit()), 100
                
        check()
        setInterval check, 100


    "restart": ->
        self = this
        
        @throttled_restart ?= _.throttle wait:1000, reset:on, ->
            @restarting = true
            self.log 'CHOCOLATEJS: Stopping server for restart'
            self.kill(@process.pid) if @process?
            self.kill(@debug_process.pid) if @debug_process?
        
        @throttled_restart()
        
    "start": ->
        process.chdir __dirname + '/..'
        args = []
        for arg, i in process.argv when i>1
            kv = arg.split '='
            switch kv[0]
                when "--appdir" then @appdir = kv[1]
                when "--port" then @port = kv[1]
                when "--memory" then @memory = kv[1]
                when "--user" then @user = kv[1]
                else args.push kv[0] unless kv[1]?
        @appdir ?=  args[0]
        @port ?=  args[1]
        @memory ?=  args[2]
        @user ?=  args[3]
        @datadir = "#{(if not @appdir? or @appdir is '.' then '.' else  Path.relative process.cwd(), @appdir)}/data"
        
        if @user? then process.setuid @user
        
        self = this

        @config = require('./config')(@datadir, reload:on).clone()
        if @config.letsencrypt?
            hostname = @config.letsencrypt.domains[0] if @config.letsencrypt.domains?
            @cert_suffix = '/letsencrypt/live/' + hostname + '/privkey.pem'
        
        process.on 'uncaughtException', (err) ->
            console.error((err && err.stack) ? new Date() + '\n' + err.stack + '\n\n' : err);
            
        process.on 'SIGTERM', -> self.exit()

        this.log 'CHOCOLATEJS: Starting server'
        this.watchFiles()

        if @config.debug
            @debug_process = Child_process.spawn("./node_modules/.bin/node-inspector", ['--web-port', @config.debug_port ? "8081"])

        args = []
        args.push @appdir if @appdir?
        args.push @port if @port?
        cmds = []
        cmds = ['--nodejs', "--max-old-space-size=#{@memory}"] if @memory?
        cmds = ['--nodejs', '--debug-brk'] if @config.debug
        cmds.push 'server/server.coffee'
        @process = Child_process.spawn("coffee", cmds.concat args)

        @process.stdout.addListener 'data', (data) ->
            process.stdout.write(data)

        @process.stderr.addListener 'data', (data) ->
            Util.log(data)

        @process.addListener 'exit', (code) ->
            self.log 'CHOCOLATEJS: Child process exited: ' + code
            self.process = null

            if self.restarting
                self.unwatchFiles()
                self.start()
                self.restarting = false
    
    "convertFile": _.throttle wait:500, reset:on, (file, file_path, file_base, curdir) ->
        file_html_name = file_path + file_base + '.html'
        add_html_file_to_git = not Fs.existsSync file_html_name
        source = null; code = null; curent_code = null
        _.flow (run) ->
            run (end) ->
                Fs.readFile file, (err, data) -> 
                    source = data.toString() unless err?
                    end()
            run (end) ->
                if source? and source isnt ""
                    try code = new Chocokup.Panel(source).render(format:yes)
                end()
            run (end) ->
                Fs.readFile file_html_name, (err, data) -> 
                    curent_code = data.toString() unless err?
                    end()
            run ->
                if code? and code isnt "" and code isnt curent_code
                    Fs.writeFile file_html_name, code, (err) ->
                        unless err? and add_html_file_to_git 
                            Child_process.exec 'git add ' + file_html_name, cwd:curdir if add_html_file_to_git
        
    "watchFiles": ->
        self = this
        
        appdir = if @appdir? then @appdir else '.'
        sysdir = Path.resolve __dirname, '..' 
        
        filter = (path) -> 
            if path.search(/^\.[^\.\/]+/) isnt -1 then return yes
            for folder in ['static']
                if path is folder then return yes
            try stats = Fs.statSync path catch then return yes
            if stats.isDirectory() then return no
            suffixes = ['.js', '.coffee', '.chocokup', '.ck', '.config.json']
            suffixes.push self.cert_suffix if self.cert_suffix?
            for suffix in suffixes
                if path.substr(path.length - suffix.length, suffix.length) is suffix then return no
            return yes

        on_add = (file) -> on_event 'add', file
        on_change = (file) -> on_event 'change', file           
        on_event = (event, file) ->
            return if self.restarting
            
            should_restart = if Path.extname(file) in ['.chocokup', '.ck'] then no else yes
            
            if File.hasWriteAccess appdir
            
                build = (file, curdir) ->
                    static_lib_dirname = curdir + '/static/lib'
                    file_ext = Path.extname file
                    file_base = Path.basename file, file_ext
                    file_rel_path = Path.dirname(file).substr folder.length for folder in [curdir + '/client/', curdir + '/general/'] when file.indexOf(folder) is 0
                    file_path = static_lib_dirname + '/' + (if file_rel_path isnt '' then file_rel_path + '/' else '')
                    File.ensurePathExists file_path
                    file_js_name = file_path + file_base + '.js'
                    add_js_file_to_git = not Fs.existsSync file_js_name
                    switch file_ext
                        when '.coffee' 
                            command = "coffee"
                            params = ['-c', '-o', file_path, file]
                        when '.js'
                            command = "cp"
                            params = [file, file_js_name]
                        else
                            self.convertFile file, file_path, file_base, curdir if file_ext in ['.chocokup', '.ck'] and file.indexOf(curdir + '/client/') is 0
                            command = param = undefined

                    bundles = self.config.build?.bundles ? []
                    bundles.push
                        filename: 'locco.js'
                        prefix: 'locco'
                        known_files: {
                            'locco/intention.js'
                            'locco/data.js'
                            'locco/action.js'
                            'locco/document.js'
                            'locco/workflow.js'
                            'locco/interface.js'
                            'locco/actor.js'
                            'locco/reserve.js'
                            'locco/prototype.js'
                        }
                        with_modules: on
                        
                    build_lib_package = (bundle) ->
                        bundle_file = ''

                        put = (pathname) ->
                            try
                                file_content = Fs.readFileSync static_lib_dirname + '/' + pathname
                                bundle_file += if bundle.with_modules
                                    """
                                    if (typeof window !== "undefined" && window !== null) { window.previousExports = window.exports; window.exports = {} };
                                    #{file_content}
                                    if (typeof window !== "undefined" && window !== null) { window.modules['#{pathname.replace ".js", ""}'] = window.exports; window.exports = window.previousExports };
                                    
                                    
                                    """
                                else 
                                    """
                                    #{file_content}
                                    
                                    
                                    """

                        sort = (a,b) ->
                            name = (path) ->
                                if (i = path.lastIndexOf '.') >= 0 then path[0...i] else path
                            if name(a) > name(b) then 1 else if name(a) < name(b) then -1 else 0
                        
                        files = File.readDirDownSync static_lib_dirname
                        files = (file.substr(static_lib_dirname.length + 1) for file in files)

                        for own filename of bundle.known_files then put filename
                        for filename in files.sort(sort) when bundle.known_files[filename] is undefined and filename.indexOf(bundle.prefix) is 0 and filename.indexOf('.spec') is -1 and filename isnt bundle.filename then put filename
                            
                        Fs.writeFileSync static_lib_dirname + '/' + bundle.filename, bundle_file   
                        
                    if command? then do (file, file_base, file_js_name, add_js_file_to_git) ->
                        self.compile_process[file] = Child_process.spawn command, params, cwd:curdir
                        self.compile_process[file].addListener 'exit', (code) ->
                            Child_process.exec 'git add ' + file_js_name, cwd:curdir if add_js_file_to_git
                            
                            for bundle in bundles
                                file_rel_name = file_rel_path + (if file_rel_path is '' then '' else '/') + file_base + file_ext
                                if file_rel_name.indexOf(bundle.prefix) is 0 and file_base.indexOf('.spec') is -1
                                    build_lib_package(bundle)
                                    
                            delete self.compile_process[file]
            
                file = appdir + '/' + file if appdir is '.'
                if (file.indexOf(appdir + '/client/') is 0 or file.indexOf(appdir + '/general/') is 0) then build file, appdir
                if (file.indexOf(sysdir + '/client/') is 0 or file.indexOf(sysdir + '/general/') is 0) then build file, sysdir

            self.log 'CHOCOLATEJS: Restarting because of ' + event + ' file at ' + file
            
            setTimeout (-> self.restart() if should_restart), 10

        @watcher = Chokidar.watch appdir, ignored: filter, persistent: yes, ignoreInitial:yes
        @watcher.on 'add', on_add
        @watcher.on 'change', on_change
        

    "unwatchFiles": ->
        @watcher.close()

    "killAll": (tree, signal, callback) ->
        killed = {}
        try
            for pid of tree
                for pidpid in tree[pid]
                    if !killed[pidpid]
                        this.killPid pidpid, signal
                        killed[pidpid] = 1
                    return
                if !killed[pid]
                    this.killPid pid, signal
                    killed[pid] = 1
                return
        catch err
            if callback?
                return callback(err)
            else
                throw err
        if callback?
            return callback()
        return
    
    
    "killPid": (pid, signal) ->
        try
            this.log "kill #{pid} #{signal ? ''}"
            process.kill parseInt(pid, 10), signal
        catch err
            if err.code != 'ESRCH'
                throw err
        return
    
    
    "buildProcessTree": (parentPid, tree, pidsToProcess, spawnChildProcessesList, cb) ->
        ps = spawnChildProcessesList(parentPid)
        allData = ''
        ps.stdout.on 'data', (data) ->
            data = data.toString('ascii')
            allData += data
            return
    
        ps.on 'close', (code) =>
            delete pidsToProcess[parentPid]
            if code != 0
                # no more parent processes
                if (o for o of pidsToProcess).length == 0
                    cb()
                return
            for pid in allData.match(/\d+/g)
                pid = parseInt(pid, 10)
                tree[parentPid].push pid
                tree[pid] = []
                pidsToProcess[pid] = 1
                this.buildProcessTree pid, tree, pidsToProcess, spawnChildProcessesList, cb
                return
            return
    
        return
    
    "kill": (pid, signal, callback) ->
        tree = {}
        pidsToProcess = {}
        tree[pid] = []
        pidsToProcess[pid] = 1
        switch process.platform
            when 'win32'
                Child_process.exec 'taskkill /pid ' + pid + ' /T /F', callback
            when 'darwin'
                this.buildProcessTree pid, tree, pidsToProcess, ((parentPid) ->
                    Child_process.spawn 'pgrep', [
                        '-P'
                        parentPid
                    ]
                ), =>
                    this.killAll tree, signal, callback
                    return
            else
                # Linux
                this.buildProcessTree pid, tree, pidsToProcess, ((parentPid) ->
                    Child_process.spawn 'ps', [
                        '-o'
                        'pid'
                        '--no-headers'
                        '--ppid'
                        parentPid
                    ]
                ), =>
                    this.killAll tree, signal, callback
                    return
                break
        return

monitor_server.start()
