import Stats from 'stats.js';
import { VisibilityToggler } from 'kedan';

class Overlay {
  constructor(domElement, stats) {
    this.domElement = domElement;
    this.visibility = new VisibilityToggler(this.domElement);

    this.footer = document.createElement('footer');
    this.footer.classList.add('sketchpad-footer');
    this.add(this.footer);

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

  clearFooter() {
    this.footer.innerHTML = '';
  }

  setAutoFooter(config, separator = ' - ') {
    const { date, author, homepage, github } = config;
    this.clearFooter();

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

  setFooter(text) {
    this.clearFooter();
    this.footer.innerText = text;
  }

  tick() {
    if (this.visibility.enabled) this.stats?.update();
  }
}

export { Overlay };
