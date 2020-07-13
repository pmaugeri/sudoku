//        0   1   2  3   4   5   6   7   8        
var p = [16, 23, 39, 8, 30, 13, 23, 10, 26];


var result = [];

while (result.length < p.length) {
    for (var i=0; i<p.length; i++) {
        if (p[i] != -1) {
            var minFreq = p[i];
            var minIndex = i;
            for (var j=0; j<p.length; j++) {
                if ((p[j] != -1) && (p[j] < minFreq)) {
                    minIndex = j;
                    minFreq = p[j];
                }
            }
            result.push(minIndex);
            p[minIndex] = -1;
            console.log("p: " + p);
            console.log("Result: " + result);
        }
    }
}
