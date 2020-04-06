const DOT = 'DOT';
const DASH = 'DASH';
const CODE_DELIMITER = 'CODE_DELIMITER';
const CHARACTER_DELIMITER = 'CHARACTER_DELIMITER';
const WORD_DELIMITER = 'WORD_DELIMITER';

const DOT_UNITS = 1;
const DASH_UNITS = 3;
const INTRA_CHARACTER_UNITS = 1;
const INTER_CHARACTER_UNITS = 3;
const INTER_WORD_UNITS = 7;
const WORD_UNITS = 50;
const MS_IN_MINUTE = 60000;

const ACTIVE_UNITS_TO_CODE = [
  { units: DOT_UNITS, code: DOT },
  { units: DASH_UNITS, code: DASH }
];

const INACTIVE_UNITS_TO_CODE = [
  { units: INTRA_CHARACTER_UNITS, code: CODE_DELIMITER },
  { units: INTER_CHARACTER_UNITS, code: CHARACTER_DELIMITER },
  { units: INTER_WORD_UNITS, code: WORD_DELIMITER }
];

const init = () => {
  listenForPress(getTimer());
  listenForColorChange();
}

const handlePress = (_, listener, timer) => {
  renderCode(getInactiveCode(timer.elapsed()));
  unlistenForPress(listener);
  listenForRelease(getTimer());
}

const handleRelease = (_, listener, timer) => {
  renderCode(getActiveCode(timer.elapsed()));
  unlistenForRelease(listener);
  listenForPress(getTimer());

}

const listenForPress = timer => on(window, 'keydown', handlePress, timer);
const listenForRelease = timer => on(window, 'keyup', handleRelease, timer);
const unlistenForPress = listener => off(window, 'keydown', listener);
const unlistenForRelease = listener => off(window, 'keyup', listener);

const listenForColorChange = () => on(q('#color'), 'change', handleChangeColor);
const handleChangeColor = event => q('[data-color]').setAttribute('data-color', event.target.value);

const render = code => {
  renderCode(code);
}

const renderCode = code => {
  if (code) {
    q('[data-morse-output]').innerHTML += `<i data-code="${code}"></i>`;
  }
}

const getCode = mapping => time => mapping
  .filter(isAboveTreshold(time))
  .map(withDiff(time))
  .reduce(
    (chosen, current) => chosen.diff > current.diff ? current : chosen,
    { diff: Infinity }
  ).code;

const getActiveCode = getCode(ACTIVE_UNITS_TO_CODE);
const getInactiveCode = getCode(INACTIVE_UNITS_TO_CODE);

const withDiff = time => ({ units, code }) => ({ code, diff: diff(toUnits(time), units) });
const isAboveTreshold = time => ({ units }) => toUnits(time) > units - 1;

const getTimer = () => {
  const startTime = Date.now();
  const elapsed = () => Date.now() - startTime;
  return { elapsed };
}

const on = (element, event, handler, ...args) => {
  const listener = event => handler(event, listener, ...args);
  element.addEventListener(event, listener)
};
const off = (element, event, handler) => element.removeEventListener(event, handler);

const q = (selector, element) => (element || document).querySelector(selector);
const qa = (selector, element) => Array.from((element || document).querySelectorAll(selector));

const diff = (a, b) => Math.abs(a - b);
const toUnits = time => time / getUnitTime();

const getUnitTime = () => MS_IN_MINUTE / (getWpm() * WORD_UNITS);
const getWpm = () => Number(q('#wpm').value)

init();
