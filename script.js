
// רשימת התלמידים והקבצים שלהם
const projects = [
  { name: "עמית ולביא - חדר כושר", file: "projects/amit.html" },
  { name: "עילי - השקעה וריבית", file: "projects/ilay.html" },
  {name: "רן - מסי והמגן", file: "projects/ran.html"}
  // כאן תוסיף עוד תלמידים בקלות
];

console.log("הסקריפט נטען בהצלחה! המערך מכיל: ", projects.length, " פרויקטים");


const listContainer = document.getElementById('buttons-list');
const iframe = document.getElementById('project-viewer');
const welcome = document.getElementById('welcome-message');

projects.forEach(p => {
  const btn = document.createElement('button');
  btn.textContent = p.name;
  btn.onclick = () => {
      welcome.style.display = 'none';
      iframe.style.display = 'block';
      iframe.src = p.file;
  };
  listContainer.appendChild(btn);
});