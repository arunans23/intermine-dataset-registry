/**
 *
 * Principal View .js
 *
 *
 */
$(document).ready(function () {

  // Search dataset functionality
  $("#search-dataset").on('keyup', function(){
    $("#list-table-body").empty();
    getDatsets($(this).val());
  });

  // When loaded, all datasets are loaded
  getDatsets("");

});

/**
 * Get datasets from the database and fill the list view.
 * @search Search query text to search among datasets
 */
function getDatsets(search){

    if (search === ''){
        $.get("service/last-update", function (response) {
            $("#mines-count").animateNumber({ number : response.lastUpdate[0].minesQueried });
        })
    }

  $.get("service/datasets/?q=" + search, function(response){
    $("#list-table-body").empty();
    var globalDatasets = response.datasets;

    $("#datasets-count").animateNumber({number : globalDatasets.length});
    for (var i = 0; i < globalDatasets.length; i++){
      var instance = globalDatasets[i];

      /*
      * ============= List View Content ===============
      */


      // Fill the list view instances list content
      $("#list-table-body").append(
        "<tr class='registry-item' id='"+ instance._id +"'>" +
          "<td class='bold mine-name'>" + instance.name + "</td>" +
          "<td class='truncate'>" + instance.description + "</td>" +
          "<td class='truncate'>" + instance.url + "</td>" +
          "<td class='truncate'>" + instance.minename + "</td>" +
        "</tr>"
      );

    }



    /*
    * ========== Loading content of List View Modal when Clicked ============
    */


    $(".deletemineb").click(function(){
      $('#delete-modal').modal({show:true});
    });


    $(".registry-item").click(function(){
      var selectedMineId = $(this).attr('id');

      $.get("service/datasets/" + selectedMineId, function(response){
        var dataset = response.dataset;

        $("#update-mine-list").attr('href', 'instance/?update=' + dataset.id);
        $("#modal-delete-mine-title").text("Delete "+ dataset.name);
        $("#mine-delete-modal-body").text("Are you sure deleting " + dataset.name + " from the Registry?")
        // Delete Instance
        $(".confirmdeleteb").click(function(){
          if (typeof user !== "undefined"){
            $('#mine-modals').modal('hide');
            $.ajax({
              url: 'service/instances/' + dataset.id,
              type: 'DELETE',
              success: function(result){
                localStorage.setItem("message", "Instance " + dataset.name + " was deleted successfully.");
                window.location = window.location.pathname;
              },
              beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
              }
            });
          }
        });

        // Synchronize Instance
        $("#sync-mine-list").click(function(){
          if (typeof user !== "undefined"){
            $.ajax({
              url: 'service/synchronize/' + dataset.id,
              type: 'PUT',
              success: function(result){
                localStorage.setItem("message", "Instance " + dataset.name + " was updated successfully.");
                window.location = window.location.pathname;
              },
              beforeSend: function(xhr){
                xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
              }
            });
          }
        });

        if (typeof dataset.images !== "undefined" && typeof dataset.images.logo !== "undefined"){
          if (dataset.images.logo.startsWith("http")){
            imageURL = dataset.images.logo;
          } else {
            imageURL = dataset.url + "/" + dataset.images.logo;
          }
        } else {
          imageURL = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png"
        }
        $("#modal-mine-img").attr("src", imageURL);

        // Fill out modal body with fields of the instance
        $("#mine-modal-body").empty();
        $("#modal-mine-title").text(dataset.name);

        $("#list-url").text(dataset.url);
        $("#list-url").attr("href", dataset.url);
        $("#mine-modal-body").append('<div class="bold"> Description: </div><p id="list-description">'+ dataset.description+' </p>');
        $("#mine-modal-body").append('<span class="bold"> URL: </span><a target="_blank" id="list-url" href="'+dataset.url+'">'+dataset.url+'</a><br>');
        $("#mine-modal-body").append('<br>');
        $("#mine-modal-body").append('<div class="alert alert-primary" id="mine-datasource-body"></div>');

        $("#mine-datasource-body").append('<span class="bold"> Datasource Name: </span><p id="list-datasource-name">'+dataset.datasourcename+'</p><br>');
        $("#mine-datasource-body").append('<span class="bold"> Datasource Url: </span><a target="_blank" id="list-datasource-url" href="'+dataset.datasourceurl+'">'+dataset.datasourceurl+'</a><br>');
        $("#mine-datasource-body").append('<span class="bold"> Datasource Description: </span><p id="list-datasource-description">'+dataset.datasourcedescription+'</p><br>');

      });
      $('#mine-modals').modal({show:true});
    });
  });
}
