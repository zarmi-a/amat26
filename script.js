console.log("הסקריפט נטען בהצלחה! המערך מכיל: ", projects.length, " פרויקטים");

// רשימת התלמידים והקבצים שלהם
const projects = [
  { name: "נועם - יחס הזהב", file: "projects/noam.html" },
  { name: "מאיה - פרקטלים", file: "projects/maya.html" },
  { name: "עידו - תורת המשחקים", file: "projects/ido.html" },
  // כאן תוסיף עוד תלמידים בקלות
];

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