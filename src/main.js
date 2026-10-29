import './style.css';

document.documentElement.classList.add('js');
import { initNeural } from './neural.js';
import { initFlowDemo } from './flow-demo.js';
import {
  initReveal,
  initNav,
  initParallax,
  initMarquee,
  initWords,
  initMagnetic,
  initTilt,
  initStrip,
  initCursor,
  initForm
} from './effects.js';

const hero = document.querySelector('.hero');
initNeural(hero.querySelector('.hero__net'), hero);
initFlowDemo(document.querySelector('.demo'));
initReveal();
initNav();
initParallax();
initMarquee();
initWords();
initMagnetic();
initTilt();
initStrip();
initCursor();
initForm();
