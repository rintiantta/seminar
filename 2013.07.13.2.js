var input = "1000000000000000"
var output = ""
var count = 0;
for (var i = input.length - 1; i >= 0; i--) {
    if (count % 3 == 0 && count != 0) {
        output = "," + output;
    }
    output = input[i] + output;
    count = count + 1;
}
console.log(output)


var start = [1];
    
for (var i = 0; i < 15; i++) {
    console.log(start); // 1121

    var end = "";
    var token = start[0];
    var count = 0;

    for (var j = 0; j < start.length; j++) {
        if (token == start[j]) {
            count = count + 1;
        } else {
            end = end + token + count;
            token = start[j];
            count = 1;
        }
    }

    end = end + token + count;
    start = end;
}
