import Stats from 'stats.js';
import { VisibilityToggler } from 'kedan';

class Overlay {
  constructor(domElement, stats) {
    this.domElement = domElement;
    this.visibility = new VisibilityToggler(this.domElement);

    if (stats) {
      this.stats = new Stats();
      this.stats.domElement.classList.add('sketchpad-stats');
      this.add(this.stats.domElement);
    }
  }

  add(domElement) {
    this.domElement.appendChild(domElement);
  }

  remove(domElement) {
    this.domElement.removeChild(domElement);
  }

  setAutoFooter(sketch, separator = ' - ') {
    const { date, author, homepage, github } = sketch.config;

    // Delete
    if (!github && !author && !date) {
      if (this.footer) {
        this.remove(this.footer);
        this.footer = undefined;
      }
      return;
    }

    // Create
    if (!this.footer) {
      this.footer = document.createElement('footer');
      this.footer.classList.add('sketchpad-footer');
      this.add(this.footer);
    }

    // Update
    const footerHTML = [];
    if (author)
      footerHTML.push(
        homepage
          ? `<a class="sketchpad-link" href="${homepage}">${author}</a>`
          : author
      );
    if (github)
      footerHTML.push(`<a class="sketchpad-link" href="${github}">Github</a>`);
    if (date) footerHTML.push(date);
    this.footer.innerHTML = footerHTML.join(separator);
  }

  tick() {
    if (this.visibility.enabled) this.stats?.update();
  }
}

export { Overlay };
