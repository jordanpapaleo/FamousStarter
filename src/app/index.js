import {core} from 'famous';
import {View} from '../shared/View';

const Context = core.Context;

class App extends View {
    render() {
        this.el.property('background', 'yellow');
    }
}

const root = new core.Context('body');
const app = new App({
    node: root.addChild(),
    model: ""
});
