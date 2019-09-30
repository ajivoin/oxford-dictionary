var https = require('https');

var OxfordDictionary = function (obj) {
    this.config = {
        app_id: obj.app_id,
        app_key: obj.app_key,
        source_lang: obj.source_lang || 'en-us'
    };
};

// GET /entries/{source_lang}/{word_id}
// GET /entries/{source_lang}/{word_id}/{filters}
OxfordDictionary.prototype.find = function (props) {
    var path = validate('/api/v2/entries/', props, this, null);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .find

// GET /entries/{source_lang}/{word_id}/definitions
OxfordDictionary.prototype.definitions = function (props) {
    var path = validate('/api/v2/entries/', props, this, 'definitions');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .definitions

// GET /entries/{source_lang}/{word_id}/examples
OxfordDictionary.prototype.examples = function (props) {
    var path = validate('/api/v2/entries/', props, this, 'examples');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .examples

// GET /entries/{source_lang}/{word_id}?fields=pronunciations
OxfordDictionary.prototype.pronunciations = function (props) {
    var path = validate('/api/v2/entries/', props, this, 'pronunciations');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .pronunciations

// GET /inflections/{source_lang}/{word_id}
// GET /inflections/{source_lang}/{word_id}/{filters}
OxfordDictionary.prototype.inflections = function (props) {
    var path = validate('/api/v2/inflections/', props, this, null);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .inflections

//GET /entries/{source_lang}/{word_id}/synonyms
OxfordDictionary.prototype.synonyms = function (props) {
    var path = validate('/api/v2/thesaurus/', props, this, 'synonyms');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .synonyms

//GET /entries/{source_lang}/{word_id}/antonyms
OxfordDictionary.prototype.antonyms = function (props) {
    var path = validate('/api/v2/thesaurus/', props, this, 'antonyms');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .antonyms

// GET /entries/{source_lang}/{word_id}/synonyms;antonyms
OxfordDictionary.prototype.thesaurus = function (props) {
    var path = validate('/api/v2/thesaurus/', props, this, 'synonyms,antonyms');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .thesaurus

// GET /entries/{source_language}/{word_id}/sentences
OxfordDictionary.prototype.sentences = function (props) {
    var path = validate('/api/v2/entries/', props, this, 'sentences');
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .sentences

// GET entries/{source_translation_language}/{target_translation_language}/{word_id}/
OxfordDictionary.prototype.translate = function (props) {
    var path = validate('/api/v2/translations/', props, this, null);
    var options = new OptionObj(path, this.config.app_id, this.config.app_key);
    return buildRequest(options);
} // .translate


// Validation function
var validate = function (path, props, $this, dtype) {
    if (typeof props === 'string') {
        props = { word: props.toLowerCase() };
    }

    if (!($this.config.app_id) || !($this.config.app_key)) {
        throw Error('API_ID or API_KEY is undefined or NULL.');
    }

    if (typeof props != 'object' && typeof props != 'string') {
        throw Error('Argument is not of proper type');
    }

    if (typeof props != 'undefined' && typeof props === 'object') {

        // translate endpoint
        if (props.hasOwnProperty('target_language') && (typeof props.target_language === 'string')) {
            path += `/${encodeURIComponent(props.target_language.toLowerCase())}`;
        }

        if (props.hasOwnProperty('word') && (typeof props.word === 'string')) {
            path += $this.config.source_lang + '/' + props.word.toLowerCase();
        } else {
            throw Error('Word argument not found');
        }

        let fields;

        if (!(dtype === null) && (typeof dtype === 'string') && !(dtype === 'entries')) {
            if (fields == null) {
                fields = `?fields=${dtype}`;
            } else {
                fields += `,${dtype}`;
            }

        }

        if (props.hasOwnProperty('filters') && (typeof props.filters === 'string')) {
            if (fields == null) {
                fields = `?fields=${encodeURIComponent(props.filters.toString())}`;
            } else {
                fields += `,${encodeURIComponent(props.filters.toString())}`;
            }
        }
        path += fields;
    }

    return path;
}; // end validateProp

// HTTPS Request Promise Builder
var buildRequest = function (options) {
    return new Promise(function (resolve, reject) {
        https.get(options, function (res) {
            if (res.statusCode == 404) {
                return reject("No such entry found.");
            }
            var data = "";

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var result;
                try {
                    result = JSON.parse(data);
                } catch (exp) {
                    result = {
                        'status_code': 500,
                        'status_text': 'JSON Parse Failed'
                    };
                    reject(result);
                }
                resolve(result);
            });

            res.on('error', function (err) {
                reject(err);
            });
        }); // end https.get
    }); // end promise
}; // end buildRequest


// Constructor Function for Option Objects
function OptionObj(path, app_id, app_key) {
    var options = {
        host: 'od-api.oxforddictionaries.com',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "app_id": app_id,
            "app_key": app_key
        }
    };
    return options;
} // end OptionObj

module.exports = OxfordDictionary;
