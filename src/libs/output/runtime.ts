export default () => (
`<script>
var mode = '<!-- mode -->';
var key = window.location.pathname;
if (mode === 'hash') {
  key = window.location.hash.slice(1);
}

try {
  var jsonList = JSON.parse('<!-- caches -->');
  var jsonItem = jsonList[key];
  if (jsonItem) {
    var content = decodeURIComponent(jsonItem['content'] || '');
    var width = jsonItem['width'];
    var image = document.createElement('img');
    image.src = content;
    image.style.display = 'block';
    image.style.margin = '0 auto';
    if (width) {
      image.style.width = width + 'px';
    } else {
      image.style.width = '100vw';
    }
    document.body.style.margin = 0;
    document.getElementById('<!-- rootID -->').appendChild(image);
  }
} catch (error) {
  console.log(error);
}
</script>
`);