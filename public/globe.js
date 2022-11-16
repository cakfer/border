"use strict";

function saveBase64AsFile(base64, fileName) {
  var link = document.createElement("a");
  document.body.appendChild(link); // for Firefox

  link.setAttribute("href", base64);
  link.setAttribute("download", fileName);
  link.click();
}

window.currentEvent = '';

function generateImage() {
  var save = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var node = document.getElementById('myNode');
  var $img = $('#myNode').find('img');
  console.log('currentEvent: ' + window.currentEvent);
  domtoimage.toPng(node).then(function (dataUrl) {
    var img = new Image();
    var tokenPreview = document.getElementById('tokenPreview');
    img.src = dataUrl;
    img.style = 'display: none';
    $('.preview').addClass('fading').fadeOut('slow', function() {
      $(this).remove();
    });
    img.classList.add('preview');
    tokenPreview.appendChild(img);
    $(img).fadeIn('slow');

    // update favicon
    var link = document.querySelector("link[rel~='icon']");
    link.href = dataUrl;

    if (save) {
      saveBase64AsFile(dataUrl, `bungferry-${Date.now()}.png`);
    }
    
  }).catch(function (error) {
    console.error('oops, something went wrong!', error);
  });
}

$(window).on('load', function(e) {
  window.currentEvent = e.type;
  generateImage();
  $(window).off('load');
});

$('input:not([type="radio"])').on('change', function(e) {
  window.currentEvent = e.type;
  var val = $(this).val().replace("C:\\fakepath\\", '');
  $('#' + $(this).attr('name') + '-display').text(val);
  if (!$(this).is('[type="file"]')) {
    document.documentElement.style.setProperty('--' + $(this).attr('name'), val + "px");
    generateImage();
  }
});

var portraitWidth = $('#portrait').outerWidth();
$('#border-width').attr({
  max: Math.round(portraitWidth / 4),
  value: Math.round(portraitWidth / 14)
}).val(Math.round(portraitWidth / 14)).trigger('change');

$('input[name="color"]').on('change', function(e) {
  window.currentEvent = e.type;
  var val = $('input[name="color"]:checked').val();
  $('.c-border').css('background', "var(--g-".concat(val, ")"));
  generateImage();
});
var upload = document.getElementById('upload');

function triggerGenerate(e) {
  window.currentEvent = e.type + ' ' + e.target;
  generateImage();
}
$(document).on('generate', triggerGenerate);

upload.addEventListener('change', readURL, true);

function readURL(e) {
  window.currentEvent = e.type + ' ' + e.target;
  var file = upload.files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
    var img = document.getElementById('portrait');
    img.src = reader.result;
    $.get(reader.result, function() {
      $(document).trigger('generate');
    }).fail(function() {
      console.log("error");
    });
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}

$('#btn_convert').on('click', function(e) {
  window.currentEvent = e.type;
  if (!$('#upload').val()) {
    $('#error').slideDown('fast');
    return;
  } else {
    $('#error').slideUp('fast');
  }

  generateImage(true);
});
