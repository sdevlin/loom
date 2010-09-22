/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true,
eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true,
immed: true, maxerr: 50, indent: 4 */
/*global loom: true*/
;
loom = (function () {
    'use strict';
    var typeOf,
        createMediator,
        defaultPropName,
        defaultNotifier,
        wrapValue,
        createObservable;
    typeOf = function (value) {
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length')) &&
                    typeof value.splice === 'function') {
                    return 'array';    
                }
            } else {
                return 'null';
            }
        }
        return s;
    };
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
    defaultPropName = 0;
    wrapValue = function (value, notifier, propName) {
        var observableValue;
        if (typeof notifier === 'undefined') {
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
    createObservable = function (o, notifier, prefix) {
        var type = typeOf(o),
            propName;
        switch (type) {
        case 'object':
            notifier = notifier || createMediator();
            prefix = prefix ? (prefix + '.') : '';
            for (propName in o) {
                if (o.hasOwnProperty(propName)) {
                    o[propName] = createObservable(
                        o[propName], 
                        notifier, 
                        prefix + propName
                    );
                }
            }
            break;
        case 'string':
        case 'number':
        case 'boolean':
        case 'null':
            o = wrapValue(o, notifier, prefix);
            break;
        case 'array':
            // do nothing . . . for now
            break;
        case 'function':
        case 'undefined':
            break;
        }
        return o;
    };
    return {
        mediator: {
            create: createMediator
        },
        observable: { 
            create: function (object) {
                createObservable(object);
            },
            map: null
        }
    };
}());
