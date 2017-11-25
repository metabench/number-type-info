
// Should not require so much for lang-essentials
var lang = require('lang-mini');
var clone = lang.clone;
// scan info basic function.
//  probably should not be here as its specific to number types.





var set_arr_tree_value = lang.set_arr_tree_value;
var get_arr_tree_value = lang.get_arr_tree_value;
var deep_arr_iterate = lang.deep_arr_iterate;


const use_satoshi_16 = true;
const use_satoshi_32 = true;

// 
const sat_16_max = (65535 / 100000000);
const sat_32_max = (4294967295 / 100000000);


class Number_Type_Info {
    constructor() {
        this.min = Number.MAX_SAFE_INTEGER;
        this.max = Number.MIN_SAFE_INTEGER;
        this.is_integer = true;
        this.num_significant_digits = 0;
    }
    process(n) {
        var sigd;
        if (Number.isInteger(n)) {
            
            //console.log('s_sn', s_sn);
            
            var sn = n + '';
            if (sn[0] === '-') {
                sigd = sn.length - 1;
            } else {
                sigd = sn.length;
            }
        } else {
            var sn = n + '';
            // then the number of digits in total.
            var s_sn = sn.split('.');
            sigd = 0;

            if (s_sn[0] === '0') {
                sigd = s_sn[1].length;
            } else {
                sigd = s_sn[0].length + s_sn[1].length;
            }

            

            this.is_integer = false;
        }
        if (sigd > this.num_significant_digits) this.num_significant_digits = sigd;

        if (n > this.max) {
            this.max = n;
        }
        if (n < this.min) {
            this.min = n;
        }
    }
    get recommended_type() {
        // integer max etc

        // deal with extra margins too?

        // For the moment, worth tightlty fitting the data types.
        //  However, newly downloaded data could be the wrong size.
        //   Need to look out for this. Could be outlier detector too?
        // Also could do some work recommending satoshi types.

        var res;

        

        if (this.min >= 0) {
            if (this.is_integer) {
                if (this.max <= 255) {
                    res = 'Uint8';
                } else if (this.max <= 65535) {
                    res = 'Uint16';
                } else if (this.max <= 4294967295) {
                    res = 'Uint32';
                } else {
                    //console.log('this.max', this.max);
                    //throw 'out of range'
                    res = 'Float64';

                }
            } else {
                if (this.num_significant_digits <= 7) {
                    res = 'Float32';
                } else {
                    res = 'Float64';

                    if (res === 'Float64' && use_satoshi_16 && this.max <= sat_16_max) {
                        res = 'Satoshi16';
                    }
                    if (res === 'Float64' && use_satoshi_32 && this.max <= sat_32_max) {
                        res = 'Satoshi32';
                    }
                    
                }



                // Can check tosee if its a satoshi value.


            }

        } else {
            // Includes negative numbers
            //  And need to look at minimum numbers
            if (this.is_integer) {
                if (this.min >= -128 && this.max <= 127) {
                    res = 'Uint8';
                } else if (this.min >= -32768 && this.max <= 32767) {
                    res = 'Uint16';
                } else if (this.min >= -2147483648 && this.max <= 2147483647) {
                    res = 'Uint32';
                } else {
                    //throw 'out of range'
                    res = 'Float64';
                }
            } else {

                if (this.num_significant_digits <= 7) {
                    res = 'Float32';
                } else {
                    res = 'Float64';
                }
            }
        }
        return res;

    }

}

// map_type_indexes

Number_Type_Info.recommend_types = (arr_tree) => {
    // the arr_tree already has got the Number_Type_Info objects

    // want to make a copy of the tree with recommended types.
    //  could use Number_Type_Info in the meantime.

    var res = clone(arr_tree);

    deep_arr_iterate(arr_tree, [], (path, item) => {

        
        //console.log('recommend_types item', item);

        if (item instanceof Number_Type_Info) {
            //console.log('item.recommended_type', item.recommended_type);

            // put it into the path...

            set_arr_tree_value(res, path, item.recommended_type);

        }





        //console.log('\n');
        //console.log('path', path);
        //console.log('item', item);

        // then changing the array items in place, or in a new structure.
        // could rebuild the structure...
        //set_arr_tree_value(scan, path, c++);

        /*

        if (item === 'number') {
            // replace it with one of these number range thingies.

            var nti = new Number_Type_Info();
            set_arr_tree_value(scan, path, nti);

        }

        */


    });

    return res;
}

module.exports = Number_Type_Info;