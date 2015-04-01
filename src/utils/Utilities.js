/*
 extends one object to another
 */
export function extend (base, addon) {
    var result = {};
    for(var key in base) {
        result[key] = base[key];
    }
    for(var key in addon) {
        if(!result[key]) {
            result[key] = addon[key];
        }
    }
    return result;
}