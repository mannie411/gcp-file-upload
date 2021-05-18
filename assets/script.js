import { firebaseConfig } from './config.js'

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.analytics();


const firebaseDb = firebase.firestore();
const firebaseStorageRef = firebase.storage();

const fileSelect = document.getElementById('file-upload'),
  fileDrag = document.getElementById('file-drag'),
  messages = document.getElementById('messages'),
  form = document.getElementById("file-upload-form"),
  removeFile = document.getElementById("remove-file");



const fileDragHover = (e) => {
  e.stopPropagation();
  e.preventDefault();

  fileDrag.className = (e.type === 'dragover' ? 'upload-area hover' : 'upload-area');
}

const output = (msg) => { messages.innerHTML = msg; }


const checkFile = (file) => {

  output('<strong>' + encodeURI(file.name) + '</strong>');

  var imageName = file.name;

  var isGood = (/\.(?=pdf)/gi).test(imageName);

  if (isGood) {
    document.getElementById('start').classList.add("hidden");
    document.getElementById('response').classList.remove("hidden");
    fileDrag.classList.remove('upload-area')

  }
  else {
    alert("Warning: Unsupported file format, please upload a PDF")
    document.getElementById('response').classList.add("hidden");
    document.getElementById('start').classList.remove("hidden");
    fileDrag.classList.add('upload-area')
    form.reset();
  }
}


const fileSelectHandler = (e) => {
  // Fetch FileList object
  var files = e.target.files || e.dataTransfer.files;

  // Cancel event and hover styling
  fileDragHover(e);

  // Process all File objects
  for (var i = 0, f; f = files[i]; i++) {
    checkFile(f);
  }

}


const submitFormData = async (data) => {

  try {

    const file = data.file;
    const fileName = data.file.name.trim(" ");

    if (!fileName) {
      alert("Warning: Empty input, Please upload a file.");
      return;
    };

    const firebaseRef = await firebaseStorageRef.ref().child('docs/' + fileName)

    await firebaseRef.put(file);

    const newData = await firebaseRef.getDownloadURL()
      .then((url) => ({ ...data, file: url }));

    await firebaseDb.collection("uploads").add(newData);

    alert("Form submitted")

    return;

  } catch (error) {

    console.log(error);

    return;
  }

}

// Events
fileSelect.addEventListener('change', fileSelectHandler, false);
fileDrag.addEventListener('dragover', fileDragHover, false);
fileDrag.addEventListener('dragleave', fileDragHover, false);
fileDrag.addEventListener('drop', fileSelectHandler, false);

removeFile.addEventListener('click', () => {
  document.getElementById('response').classList.add("hidden");
  document.getElementById('start').classList.remove("hidden");
  fileDrag.className = 'upload-area';
  fileSelect.value = "";

});

form.addEventListener('submit', event => {

  event.preventDefault();

  const keys = ["fname", "lname", "email", "adobeID", "file"];
  let values = [];
  let newValues = {};

  const data = new FormData(form);

  for (const v of data.values()) values.push(v)

  for (let i = 0; i < keys.length; i++) newValues[keys[i]] = values[i];

  submitFormData(newValues);

  document.getElementById('response').classList.add("hidden");
  document.getElementById('start').classList.remove("hidden");
  fileDrag.classList.add('upload-area')
  form.reset();

});
