var eventHandlers = {};
function on (eventName, eventHandler) {
	eventHandlers[eventName] = eventHandler;
}

function send () {
	postMessage({ event: arguments[0], args: Array.prototype.slice.call(arguments, 1) });
};

on('test', function (msg) {
	send('log', 'Echo: '+msg);
});

addEventListener('message', function (e) {
	if ('data' in e && e.data !== undefined && 'event' in e.data && e.data.event in eventHandlers)
		eventHandlers[e.data.event].apply(self, e.data.args);
}, false);