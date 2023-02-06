manageBundlesModal = jQuery(".manage-bundles-modal");

jQuery('._js_bundles-manage').on('click', function(e){
  e.preventDefault();

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'api/bundle/list', true);
  xhr.send();

  xhr.onloadend = function() {
    if(xhr.status == 200) {
      if(xhr.response != undefined && xhr.response.length != 0) {
        manageBundlesModal.find('.modal-body').html('<div class="btn-group" role="group"></div>');
        jsonResponse = JSON.parse(xhr.response)
        jQuery.each(jsonResponse, function(k, v) {
          manageBundlesModal.find('.modal-body .btn-group').append('<button class="btn btn-outline-primary _js_specific-bundle" data="'+v+'">'+v+'</button>');
        });
      }
      else {
        manageBundlesModal.find('.modal-body').html("An error has occurred. Please try again. If problem persists contact server administrator.")
      }
    }
    else if(xhr.status == 204) {
      manageBundlesModal.find('.modal-body').html("<p>No bundles current exist on the server.</p>")
    }
    else {
      if(xhr.response != undefined && xhr.response.length != 0) {
        manageBundlesModal.find('.modal-body').html(xhr.response)
      }
      else {
        manageBundlesModal.find('.modal-body').html(xhr.status + " Error!")
      }
    }
  }

  manageBundlesModal.modal('show');
});
