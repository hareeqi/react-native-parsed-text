'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _reactNative2 = _interopRequireDefault(_reactNative);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

var TextExtraction = function () {
  /**
   * @param {String} text - Text to be parsed
   * @param {Object[]} patterns - Patterns to be used when parsed
   *                              other options than pattern would be added to the parsed content
   * @param {RegExp} patterns[].pattern - RegExp to be used for parsing
   */
  function TextExtraction(text, patterns) {
    _classCallCheck(this, TextExtraction);

    this.text = text;
    this.patterns = patterns || [];
  }

  /**
   * Returns parts of the text with their own props
   * @return {Object[]} - props for all the parts of the text
   */


  _createClass(TextExtraction, [{
    key: 'parse',
    value: function parse() {
      var _this = this;

      var parsedTexts = [{ children: this.text }];
      this.patterns.forEach(function (pattern) {
        var newParts = [];

        parsedTexts.forEach(function (parsedText) {
          // Only allow for now one parsing
          if (parsedText._matched) {
            newParts.push(parsedText);

            return;
          }

          var parts = [];
          var textLeft = parsedText.children;

          while (textLeft) {
            var matches = pattern.pattern.exec(textLeft);

            if (!matches) {
              break;
            }

            var previousText = textLeft.substr(0, matches.index);

            parts.push({ children: previousText });

            parts.push(_this.getMatchedPart(pattern, matches[0], matches));

            textLeft = textLeft.substr(matches.index + matches[0].length);
          }

          parts.push({ children: textLeft });

          newParts.push.apply(newParts, parts);
        });

        parsedTexts = newParts;
      });

      // Remove _matched key.
      parsedTexts.forEach(function (parsedText) {
        return delete parsedText._matched;
      });

      return parsedTexts.filter(function (t) {
        return !!t.children;
      });
    }

    // private

    /**
     * @param {Object} matchedPattern - pattern configuration of the pattern used to match the text
     * @param {RegExp} matchedPattern.pattern - pattern used to match the text
     * @param {String} text - Text matching the pattern
     * @param {String[]} text - Result of the RegExp.exec
     * @return {Object} props for the matched text
     */

  }, {
    key: 'getMatchedPart',
    value: function getMatchedPart(matchedPattern, text, matches) {
      var props = {};

      Object.keys(matchedPattern).forEach(function (key) {
        if (key === 'pattern' || key === 'renderText') {
          return;
        }

        if (typeof matchedPattern[key] === 'function') {
          props[key] = function () {
            return matchedPattern[key](text);
          };
        } else {
          props[key] = matchedPattern[key];
        }
      });

      var children = text;
      if (matchedPattern.renderText && typeof matchedPattern.renderText === 'function') {
        children = matchedPattern.renderText(text, matches);
      }

      return _extends({}, props, {
        children: children,
        _matched: true
      });
    }
  }]);

  return TextExtraction;
}();

var PATTERNS = {
  url: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/i,
  phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,7}/,
  email: /\S+@\S+\.\S+/
};

var defaultParseShape = _propTypes2.default.shape(_extends({}, _reactNative2.default.Text.propTypes, {
  type: _propTypes2.default.oneOf(Object.keys(PATTERNS)).isRequired
}));

var customParseShape = _propTypes2.default.shape(_extends({}, _reactNative2.default.Text.propTypes, {
  pattern: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.instanceOf(RegExp)]).isRequired
}));

var ParsedText = function (_React$Component) {
  _inherits(ParsedText, _React$Component);

  function ParsedText() {
    _classCallCheck(this, ParsedText);

    return _possibleConstructorReturn(this, (ParsedText.__proto__ || Object.getPrototypeOf(ParsedText)).apply(this, arguments));
  }

  _createClass(ParsedText, [{
    key: 'setNativeProps',
    value: function setNativeProps(nativeProps) {
      this._root.setNativeProps(nativeProps);
    }
  }, {
    key: 'getPatterns',
    value: function getPatterns() {
      return this.props.parse.map(function (option) {
        var type = option.type,
            patternOption = _objectWithoutProperties(option, ['type']);

        if (type) {
          if (!PATTERNS[type]) {
            throw new Error(option.type + ' is not a supported type');
          }
          patternOption.pattern = PATTERNS[type];
        }

        return patternOption;
      });
    }
  }, {
    key: 'getParsedText',
    value: function getParsedText() {
      var _this3 = this;

      if (!this.props.parse) {
        return this.props.children;
      }
      if (typeof this.props.children !== 'string') {
        return this.props.children;
      }

      var textExtraction = new TextExtraction(this.props.children, this.getPatterns());

      return textExtraction.parse().map(function (props, index) {
        return _react2.default.createElement(_reactNative2.default.Text, _extends({
          key: 'parsedText-' + index
        }, _this3.props.childrenProps, props));
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var baseProps = _extends({}, this.props);
      delete baseProps.childrenProps;
      delete baseProps.parse;
      return _react2.default.createElement(_reactNative2.default.Text, _extends({
        ref: function ref(_ref) {
          return _this4._root = _ref;
        }
      }, baseProps), this.getParsedText());
    }
  }]);

  return ParsedText;
}(_react2.default.Component);

ParsedText.displayName = 'ParsedText';
ParsedText.propTypes = _extends({}, _reactNative2.default.Text.propTypes, {
  parse: _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([defaultParseShape, customParseShape])),
  childrenProps: _propTypes2.default.shape(_reactNative2.default.Text.propTypes)
});
ParsedText.defaultProps = {
  parse: null,
  childrenProps: {}
};
exports.default = ParsedText;
