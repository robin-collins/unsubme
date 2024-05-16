// /public/js/navbar-toggle.js

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navbar-toggle').addEventListener('click', function() {
    document.getElementById('navbar').classList.toggle('hidden');
  });
});
