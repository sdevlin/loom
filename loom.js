/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, maxerr: 50, indent: 4 */
var loom = (function () {
    'use strict';
    var createMediator, 
        createObservableValue,
		defaultPropName = 0,
		defaultNotifier,
		createObservableObject;
    createMediator = function () {
        var events = {};
        return {
            subscribe: function (eventName, callback) {
                events[eventName] = events[eventName] || [];
                events[eventName].push(callback);
            },
            publish: function (eventName) {
                var callbacks = events[eventName], 
                    args,
                    i;
                if (callbacks) {
                    args = Array.prototype.slice.call(arguments, 1);
                    for (i = 0; i < callbacks.length; i += 1) {
                        callbacks[i].apply(null, args);
                    }
                }
            }
        };
    };
	defaultNotifier = createMediator();
	createObservableValue = function (value, propName, notifier) {
		var observableValue;
		if (typeof propName === 'undefined') {
			propName = defaultPropName.toString();
			defaultPropName += 1;
			notifier = notifier || defaultNotifier;
		}
		observableValue = function (newValue) {
			var oldValue;
			if (typeof newValue !== 'undefined' && 
				value !== newValue) {
				oldValue = value;
				value = newValue;
				notifier.publish(propName, value, oldValue);
			}
			return value;
		};
		observableValue.observe = function (observer) {
			notifier.subscribe(propName, observer);
		};
		return observableValue;
	};
    createObservableObject = function (properties) {
        var notifier = createMediator(), 
            observable, 
            propName;
        observable = (function () {
			var observableProperties = [];
			return {
				register: function (propName, value) {
					this[propName] = createObservableValue(value, propName, notifier);
					observableProperties.push(propName);
				},
				observableProperties: function () {
					return observableProperties.slice(0);
				}
			};
		}());
        for (propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                observable.register(propName, properties[propName]);
            }
        }
        return observable;
    };
    return {
        createMediator: createMediator,
		observable: {
			createValue: function (value) {
				createObservableValue(value);
			},
			createObject: createObservableObject
		}
    };
}());
