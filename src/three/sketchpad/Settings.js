import { clone, logNameTaken } from 'kedan';

class Settings {
  constructor(settings) {
    this.defaults = clone(settings);
    Object.entries(settings).forEach(([key, value]) => {
      if (this[key] !== undefined) return logNameTaken(key);
      this[key] = value;
    });
    if (settings.sketchpad?.autoLoad) this.load();
  }

  reset() {
    Object.keys(this).forEach((key) => {
      this[key] =
        this.defaults[key] !== undefined
          ? clone(this.defaults[key])
          : this[key];
    });
    if (this.sketchpad?.autoSave) this.save();
  }

  save() {
    const settings = clone(this);
    delete settings.defaults;
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  load() {
    const settings = JSON.parse(localStorage.getItem('settings'));
    Object.assign(this, settings);
  }
}

export { Settings };
