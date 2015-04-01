###
 - reference du prototype créé au moment de la sauvegarde dans reserve d'un objet javascript
 - reference est un uuid lié au chemin du fichier à partir de /general
 - les uuid sont stockés dans la base de donnée en tant qu'objet avec 
   - id = uuid 
   - type de container = Prototype.javascript 
   - ancestors = concaténation des uuid des parents 
   - path = chemin vers le source
 - stockage de la référence du prototype : dans la bdd avec le type de container Data.Binary.Uuid.family ; dans l'objet en tant que propriété sous _
 - lors de la désérialisation, si l'on tombe sur une propriété de type Prototype.javascript, 
   on remplace le parent par une nouvelle instance de la classe en question... 
###
_ = require '../../general/chocodash'

Prototype = _.prototype
    constructor: ->

_module = window ? module
if _module.exports? then _module.exports = Prototype else window.Locco ?= {} ; window.Locco.Prototype = Prototype