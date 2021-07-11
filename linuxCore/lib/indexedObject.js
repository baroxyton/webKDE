//indexedObject database library written by me
//license: https://unlicense.org/
function IndexedObject(name, startValue) {
	let db, store;
	let rq = window.indexedDB.open(name, 1);
	this.reset = function() {
		indexedDB.deleteDatabase(name);
		db.data = startValue;
	};
	rq.onupgradeneeded = function(e) {
		db = e.target.result;
		store = db.createObjectStore('projectStore', { keyPath: 'projectName' });
		store.createIndex('data', 'data');
	};
	startValue = startValue || {};
	let self = this;
	let oldData = {};
	this.data = startValue;
	this.allKeys = function() {
		var transaction = db.transaction(['projectStore'], 'readwrite');
		var objectStore = transaction.objectStore('projectStore');
		var krq = objectStore.getAllKeys();
		return new Promise(function(resolve, reject) {
			krq.onsuccess = function() {
				resolve(krq.result);
			};
			krq.onerror = alert;
		});
	};
	this.save = function() {
		if (oldData == JSON.stringify(self.data)) {
			return;
		}
		var transaction = db.transaction(['projectStore'], 'readwrite');
		var objectStore = transaction.objectStore('projectStore');
		var data = { projectName: 'dbData', data: self.data };
		var rrq = objectStore.put(data);
		oldData = JSON.stringify(self.data);
		return new Promise(function(resolve, reject) {
			transaction.oncomplete = function() {
				resolve(rrq.result);
			};
		});
	};
	this.getData = function() {
		var transaction = db.transaction(['projectStore'], 'readwrite');
		objectStore = transaction.objectStore('projectStore');
		var rrq = objectStore.get('dbData');
		return new Promise(function(resolve, reject) {
			transaction.oncomplete = function() {
				resolve(rrq.result);
			};
		});
	};
	this.onready = new Promise(async function(resolve) {
		try {
			rq.onsuccess = async function(e) {
				db = e.target.result;
				let data = await self.getData();
				data ? (self.data = data.data) : 0;
				setInterval(self.save, 1000);
				resolve();
			};
		} catch (err) {
			alert(err);
		}
	});
}
