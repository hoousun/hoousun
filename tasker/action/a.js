const gzipBase64Encode = function(str) {
  const gzStr = pako.gzip(str);
  const arr = Array.from(gzStr, item => String.fromCharCode(item));
  return btoa(arr.join(''));
};

const getTkXml = async function(path) {
  const response = await fetch(path + '?t=' + Date.now());
  if (!response.ok) {
    throw new Error("Network response was not OK");
  }
  return await response.text();
};

const getTkTypeFromXml = function(data) {
  types = ['project', 'profile', 'task'];
  for (let type of types) {
    const re = new RegExp('[\\s\\S]*<' + type + '\\s+sr(.|\\s)*?</n(|a)me>[\\s\\S]*', 'i');
    if (re.test(data)) return type;
  }
  throw new Error('no type');
};

const getTkdataScheme = function(data) {
  return 'tasker' + getTkTypeFromXml(data) + '://';
};

const getTkUri = function(data) {
  return getTkdataScheme(data) + gzipBase64Encode(data);
};

(async () => {
  const node = document.getElementById('main')
  node.innerHTML = '<img src="/assets/image/loading.gif" width="16" /> Loading';
  try {
    const params = new URLSearchParams(document.location.search);
    const path = params.get('p');
    const data = await getTkXml(path);
    const output = [];
    output.push('<a href="' + getTkUri(data) + '">Click to import</a>');
    const fname = path.replace(/^.*[\\\/]/, '');
    output.push('<a href="' + path + '" download="' + fname + '">Click to download</a>');
    output.push('<a href="' + path + '" target="_blank">Raw</a>');
    node.innerHTML = output.join('  /  ');
 } catch (e){
    node.innerHTML = 'Bad request';
 }
})();
