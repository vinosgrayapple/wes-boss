import '../sass/style.scss';

import {
    $,
    $$
} from './modules/bling';
import autocomplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead'
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';
// const q = 
typeAhead($('.search'))

autocomplete($('#address'), $('#lat'), $('#lng'))

makeMap($('#map'))
const heartForms = $$('form.heart')
heartForms.on('submit', ajaxHeart)