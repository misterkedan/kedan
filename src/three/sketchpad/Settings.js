import { clone, logNameTaken, stringToKey } from 'kedan';

class Settings {
  constructor(settings) {
    this.id =
      settings?.sketchpad?.id ||
      (function getAutoId() {
        const author = settings?.sketchpad?.author || 'sketch';
        const name = settings?.sketchpad?.name || 'untitled';
        return `${stringToKey(author)}-${stringToKey(name)}`;
      })();
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
    delete settings.id;
    delete settings.defaults;
    localStorage.setItem(this.id, JSON.stringify(settings));
  }

  load() {
    const settings = JSON.parse(localStorage.getItem(this.id));
    if (!settings || !settings?.sketchpad?.name !== this.sketchpad?.name)
      return;
    Object.assign(this, settings);
  }
}

export { Settings };
