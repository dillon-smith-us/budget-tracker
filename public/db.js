let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore("pending", {autoIncrement: true})
};

request.onerror =(err) => {
    console.log("wooops" + err.message)
};

request.onsuccess = function(e) {
    db = e.target.result;

     //is app online?
     if (navigator.onLine) {
        checkDatabase();
    }
}

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
              .then(() => {
                  // if succesful, delete records
                  const transaction = db.transaction(["pending"], "readwrite");
                  const store = transaction.objectStore("pending");
                  store.clear();
              });
        }
    };

}
    window.addEventListener("online", checkDatabase);