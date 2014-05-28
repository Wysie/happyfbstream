function save_options() {
  var apikey = document.getElementById('apikey').value;
  chrome.storage.sync.set({
    apikey: apikey
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    apikey: '',
  }, function(items) {
    document.getElementById('apikey').value = items.apikey;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);