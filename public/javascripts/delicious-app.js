import '../sass/style.scss';

import {
    $,
    $$
} from './modules/bling';
import autocomplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead'
// const q = 
typeAhead($('.search'))

autocomplete($('#address'), $('#lat'), $('#lng'))