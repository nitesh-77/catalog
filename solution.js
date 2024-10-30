function decodeBaseN(value, base) {
    if (base <= 10) {
        return parseInt(value, base);
    } else {
        // For bases > 10, handle letters manually
        const digitMap = {};
        for (let i = 0; i < 10; i++) {
            digitMap[i.toString()] = i;
        }
        for (let i = 0; i < 6; i++) {
            digitMap[String.fromCharCode('a'.charCodeAt(0) + i)] = 10 + i;
        }
        
        let result = 0;
        for (const digit of value.toLowerCase()) {
            result = result * base + digitMap[digit];
        }
        return result;
    }
}

// Extract and decode points from JSON data
function getPointsFromJson(jsonData) {
    const k = jsonData.keys.k;
    const points = [];
    
    // Get first k points from the data
    let count = 0;
    for (const [x, data] of Object.entries(jsonData)) {
        if (x === 'keys') continue;
        if (count >= k) break;
        
        const xVal = parseInt(x);
        const yVal = decodeBaseN(data.value, parseInt(data.base));
        points.push([xVal, yVal]);
        count++;
    }
    
    return points;
}

// Gaussian elimination to solve the system of linear equations
function gaussianElimination(matrix) {
    const n = matrix.length;
    
    for (let i = 0; i < n; i++) {
        // Find pivot
        let maxEl = Math.abs(matrix[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > maxEl) {
                maxEl = Math.abs(matrix[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row
        for (let k = i; k < n + 1; k++) {
            const tmp = matrix[maxRow][k];
            matrix[maxRow][k] = matrix[i][k];
            matrix[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (let k = i + 1; k < n; k++) {
            const c = -matrix[k][i] / matrix[i][i];
            for (let j = i; j < n + 1; j++) {
                if (i === j) {
                    matrix[k][j] = 0;
                } else {
                    matrix[k][j] += c * matrix[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b using back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = matrix[i][n] / matrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            matrix[k][n] -= matrix[k][i] * x[i];
        }
    }
    return x;
}

// Find the constant term (secret) from the points
function findSecret(points) {
    const n = points.length;
    const matrix = Array(n).fill().map(() => Array(n + 1).fill(0));
    
    // Build the matrix for the system of equations
    for (let i = 0; i < n; i++) {
        const [x, y] = points[i];
        for (let j = 0; j < n; j++) {
            matrix[i][j] = Math.pow(x, n - 1 - j);
        }
        matrix[i][n] = y;
    }
    
    // Solve the system using Gaussian elimination
    const coefficients = gaussianElimination(matrix);
    
    // Return the constant term (last coefficient)
    return Math.round(coefficients[coefficients.length - 1]);
}

// Test cases provided in the assignment
const testCase1 = {
    "keys": { "n": 4, "k": 3 },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2", "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4", "value": "213" }
};

const testCase2 = {
    "keys": { "n": 10, "k": 7 },
    "1": { "base": "6", "value": "13444211440455345511" },
    "2": { "base": "15", "value": "aed7015a346d63" },
    "3": { "base": "15", "value": "6aeeb69631c227c" },
    "4": { "base": "16", "value": "e1b5e05623d881f" },
    "5": { "base": "8", "value": "316034514573652620673" },
    "6": { "base": "3", "value": "2122212201122002221120200210011020220200" },
    "7": { "base": "3", "value": "20120221122211000100210021102001201112121" },
    "8": { "base": "6", "value": "20220554335330240002224253" },
    "9": { "base": "12", "value": "45153788322a1255483" },
    "10": { "base": "7", "value": "1101613130313526312514143" }
};

// Solve and print both secrets
const points1 = getPointsFromJson(testCase1);
const points2 = getPointsFromJson(testCase2);

const secret1 = findSecret(points1);
const secret2 = findSecret(points2);

// Print both secrets simultaneously
console.log(secret1);
console.log(secret2);