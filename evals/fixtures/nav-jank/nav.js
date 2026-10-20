// Magnetic hover effect for the nav links.
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("mousemove", (e) => {
    const rect = link.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    link.style.marginLeft = dx / 6 + "px";
    link.style.letterSpacing = Math.abs(dx) / 80 + "px";
    link.dataset.w = link.offsetWidth;
  });
  link.addEventListener("mouseleave", () => {
    link.style.marginLeft = "0px";
    link.style.letterSpacing = "0px";
  });
});
