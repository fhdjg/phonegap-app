        // document.addEventListener("deviceready", onDeviceReady, false);
        var db = null;
        var currentRow;
        var ar_backup =[];
        function populateDB(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS tb_barang (id INTEGER PRIMARY KEY AUTOINCREMENT, no_faktur,nama_barang,harga,ket)');
        }

        // Query the database
        function queryDB(tx) {
            tx.executeSql('SELECT * FROM tb_barang', [], querySuccess, errorCB);
        }
        function searchQueryDB(tx) {
            tx.executeSql("SELECT * FROM tb_barang where name like ('%"+ document.getElementById("txtName").value + "%')",
                    [], querySuccess, errorCB);
        }
        function queryDB_backup(tx) {
            tx.executeSql('SELECT * FROM tb_barang', [], queryBackup, errorCB);
        }

        function queryBackup(tx, res) {
            var len = res.rows.length;
            for (var i = 0; i < len; i++) {
              ar_backup[i] = {
                    id: res.rows.item(i).id,
                    no_faktur: res.rows.item(i).no_faktur,
                    nama_barang: res.rows.item(i).nama_barang,
                    harga: res.rows.item(i).harga,
                    ket: res.rows.item(i).ket
                }
/*              res.rows.item(i).no_faktur;
              res.rows.item(i).nama_barang;
              res.rows.item(i).harga;
              res.rows.item(i).ket;
              res.rows.item(i).id;*/
            }
        }

        // Query the success callback
        function querySuccess(tx, res) {
            var len = res.rows.length;
            var t="";
            for (var i = 0; i < len; i++) {
                      t+='<li class="swipeout">';
                        t+='<div class="swipeout-content">';
                          t+='<a href="#" class="item-link item-content">';
                            t+='<div class="item-inner">';
                              t+='<div class="item-title-row">';
                                t+='<div class="item-title">'+res.rows.item(i).nama_barang+'</div>';
                                t+='<div class="item-after none">'+res.rows.item(i).no_faktur+'</div>';
                              t+='</div>';
                              t+='<div class="item-subtitle">Harga : '+res.rows.item(i).harga+'</div>';
                              if (res.rows.item(i).ket !== "" ) { 
                              t+='<div class="item-text">Ket : '+res.rows.item(i).ket+'</div>';
                              }
                            t+='</div>';
                          t+='</a>';
                        t+='</div>';
                        t+='<div class="swipeout-actions-right">';
                          t+='<a href="#" class="bg-orange" onclick="edit_barang(\''+
                          res.rows.item(i).no_faktur+'\',\''+
                          res.rows.item(i).nama_barang+'\',\''+
                          res.rows.item(i).harga+'\',\''+
                          res.rows.item(i).ket+'\',\''+
                          res.rows.item(i).id+'\')">Ubah</a>';
                          t+='<a href="#" data-confirm="Hapus Data ?" class="swipeout-delete swipeout-overswipe swipe_del_barang" data-id="'+res.rows.item(i).id+'">Hapus</a></div>';
                      t+='</li>';
            $$('.tmp_barang').html(t);
            $$('.swipeout').on('swipeout:deleted', function (data) {
               var id = $$(this).children(".swipeout-actions-right").children(".swipe_del_barang").attr("data-id");
              del_barang(id);
            });
            }
        }
        //Delete query
         function del_barang(id){
            var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
            db.transaction(function (tx) {
            tx.executeSql('DELETE FROM tb_barang WHERE id = ' + id);
            }, function (error) {
                myApp.alert('error : '+error.message);
            }, function () {
                myApp.alert($$("Barang dihapus!"));
            });
        }
        // Transaction error callback
        function errorCB(err) {
            alert("Error processing SQL: "+err.code);
        }
        // Transaction success callback
        function successCB() {
            var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
            db.transaction(queryDB, errorCB);
        }

         // Cordova is ready
        function onDeviceReady() {
            var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
            db.transaction(populateDB, errorCB, successCB);
        }
        //Insert query
        function goSearch() {
            var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
            db.transaction(searchQueryDB, errorCB);
        }
        //Show the popup after tapping a row in table
        function edit_barang(no_faktur,nm_barang,harga,ket,id) {
            // currentRow=row;
            mainView.router.load({
                url:'barang_crud.html?no_faktur='+no_faktur+'&nm_barang='+nm_barang+'&harga='+harga+'&ket='+ket+"&id="+id,
                ignoreCache:true
          });
        }

var myApp = new Framework7({
    modalTitle: 'Notif',
    material: true,
    pushState:true,
    activeState:true,
    materialRipple:false,
    cache:true,
    animatePages:true,
    cacheIgnoreGetParameters:false,
    init: false
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
});


myApp.onPageInit('menu_utama', function (page) {
    onDeviceReady();
});
myApp.onPageInit('barang', function (page) {
var mySearchbar = myApp.searchbar('.searchbar', {
    searchList: '.list-block-search',
    searchIn: '.item-title, .item-after'
});  
    successCB();

    var cari_barang = $$('.searchbar')[0].f7Searchbar; 
    $$('.btn-cari-barcode').on('click', function(){
        cordova.plugins.barcodeScanner.scan(
          function (result) {
                cari_barang.search(result.text);
          },
          function (error) {
              alert("Scanning gagal: " + error);
          },
          {
              preferFrontCamera : true,
              showFlipCameraButton : true,
              showTorchButton : true,
              torchOn: true,
              saveHistory: true,
              prompt : "Place a barcode inside the scan area",
              resultDisplayDuration: 500,
              formats : "QR_CODE,PDF_417",
              orientation : "landscape",
              disableAnimations : true,
              disableSuccessBeep: false
          }
       );
    });

    // Pull to refresh content
    var ptrContent = $$(page.container).find('.pull-to-refresh-content');
    // Add 'refresh' listener on it
    ptrContent.on('refresh', function (e) {
        // Emulate 2s loading
        setTimeout(function () {
/*            var t="";
            for (var i = 0; i < 10; i++) {
                      t+='<li class="swipeout">';
                        t+='<div class="swipeout-content">';
                          t+='<a href="#" class="item-link item-content">';
                            t+='<div class="item-inner">';
                              t+='<div class="item-title-row">';
                                t+='<div class="item-title">brg-'+i+'</div>';
                                t+='<div class="item-after none">dollar-'+i+'</div>';
                              t+='</div>';
                              t+='<div class="item-subtitle">Harga : 00'+i+'</div>';
                              t+='<div class="item-text">ket-'+i+'</div>';
                            t+='</div>';
                          t+='</a>';
                        t+='</div>';
                        t+='<div class="swipeout-actions-right">';
                          t+='<a href="#" class="bg-orange" onclick="edit_barang(\'faktur-'+i+'\',\'brg-'+i+'\',\'00'+i+'\',\'ket-'+i+'\')">Ubah</a>';
                          t+='<a href="#" data-confirm="Hapus Data ?" class="swipeout-delete swipeout-overswipe swipe_del_barang" data-id="'+i+'">Hapus</a></div>';
                      t+='</li>';
            $$('.tmp_barang').html(t);
            $$('.swipeout').on('swipeout:deleted', function (data) {
              console.log( $$(this).children(".swipeout-actions-right").children(".swipe_del_barang").attr("data-id"));
            });
            }*/
            cari_barang.disable();
            successCB();
            myApp.pullToRefreshDone();
        }, 1000);
    });
}); 
myApp.onPageInit('barang_crud', function (page) {
    $$('.btn-barcode').on('click', function(){
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              /*alert("We got a barcode\n" +
                    "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled);*/
                $$('.tmp_no_faktur').html(result.text);
          },
          function (error) {
              alert("Scanning gagal: " + error);
          },
          {
              preferFrontCamera : true, // iOS and Android
              showFlipCameraButton : true, // iOS and Android
              showTorchButton : true, // iOS and Android
              torchOn: true, // Android, launch with the torch switched on (if available)
              saveHistory: true, // Android, save scan history (default false)
              prompt : "Place a barcode inside the scan area", // Android
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
              orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
              disableAnimations : true, // iOS
              disableSuccessBeep: false // iOS and Android
          }
       );
    });

  if(Object.keys(page.query).length !== 0){
        $$('.tmp_no_faktur').html(page.query.no_faktur);
        $$('#nm_barang').val(page.query.nm_barang);
        $$('#harga_barang').val(page.query.harga);
        $$('#ket_barang').val(page.query.ket);
        $$('[data-page = "barang_crud"]').children('.navbar').addClass('theme-gray');
        $$('.tmp_cap_barang').html("Edit Barang");
        $$('#simpan_barang').html("perbarui");
  }else{
        function faktur(){return "brg-" + Math.floor(Math.random() * 10000000000).toString().substring(0,10);}
        $$('.tmp_no_faktur').html(faktur());
        $$('.btn-auto-faktur').on('click', function(){
        $$('.tmp_no_faktur').html(faktur());
        });
  }

    $$('#simpan_barang').on('click', function(){
        var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
        if ($$(this).html() === "simpan") {
            db.transaction(function (tx) {
                tx.executeSql('INSERT INTO tb_barang (no_faktur,nama_barang,harga,ket) VALUES ("' +$$('.tmp_no_faktur').html()
                        +'","'+$$('#nm_barang').val()
                        +'","'+$$('#harga_barang').val()
                        +'","'+$$('#ket_barang').val()                    
                        +'")');
            }, function (error) {
                myApp.alert('error : '+error.message);
            }, function () {
                myApp.alert($$('#nm_barang').val() + " telah ditambah!",function(){
                    $$('#nm_barang').val("");
                    $$('#harga_barang').val("");
                    $$('#ket_barang').val("");
                });
            });
        }else{
            db.transaction(function (tx) {
                tx.executeSql('UPDATE tb_barang SET nama_barang ="'+$$('#nm_barang').val()+'", harga= "'+$$('#harga_barang').val()+'", ket="'+$$('#ket_barang').val()+'" WHERE id = '+ page.query.id);
            }, function (error) {
                myApp.alert('error : '+error.message);
            }, function () {
                myApp.alert("Data telah diubah!",function(){
                    $$('#nm_barang').val("");
                    $$('#harga_barang').val("");
                    $$('#ket_barang').val("");
                    mainView.router.back();
                });
            });
        }
    });

}); 
function getPath() {
    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );
    return 'file://' + path;
   };

myApp.onPageInit('backup', function (page) {


window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
    // console.log('file system open: ' + dirEntry.name);
    myApp.alert(dirEntry.name);
    var isAppend = true;
    createFile(dirEntry, "fileToAppend.txt", isAppend);
}, onErrorLoadFs);

  // var db = window.openDatabase("Database", "1.0", "dbBarang", 200000);
  $$('.btn-export').on('change', function(){
    // db.transaction(queryDB_backup, errorCB);
    for (var i = 0; i < 10; i++) {
      ar_backup[i] = {
            id: "id_"+i,
            no_faktur: "no_faktur_"+i,
            nama_barang: "nama_barang_"+i,
            harga: "harga_"+i,
            ket: "ket_"+i
        }
    }
    // alert(getPath());

   // var blob = new Blob([JSON.stringify(ar_backup)], {type: "text/plain;charset=utf-8"});
   // saveAs(blob, "export_database.txt");
  });
});
myApp.init();

