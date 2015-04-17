import {core, transitions} from 'famous';
import {View} from '../base-views/View';
import UI from '../utils/UI';

const Curves   = transitions.Curves;
const Famous   = core.Famous;

class App extends View {
    constructor(options) {
        super(options);
    }

    render() {
        this.el.property('background', 'yellow');
    }
}

const root = core.Famous.createContext('body');
window.app = new App({
    node: root.addChild(),
    model: ""
});
