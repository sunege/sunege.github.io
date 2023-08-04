//問題のフレットと弦
let qRootFlet;
let qRootString;
let qFlet;
let qString;

//答えのインデックス
let ansIndex;
//指板のインデックス[string-1][flet-1]
let fingerBoardIndexArrays = new Array();

//ボタンのフラグ
let isAnswered = false;

//インターバルとディグリーネーム（インデックスと度数の対応）
const degreeNames = [
    'R',
    '♭9(m2)',
    '9(Δ2)',
    'm3',
    'Δ3',
    '11(4)',
    '♭5',
    'P5',
    '♭13(m6)',
    '13(Δ6)',
    'm7',
    'Δ7'
    ];

//乱数獲得しましょう
const getRandomInt = (max, min) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


//degreenameのインデックスを0~11にする関数
const ringZ12 = x => {
    if( x >= 12 ) {
        x -= 12;
        return ringZ12(x);
    }
    else if( x >= 0 ){
        return x;
    }
    else{
        x += 12;
        return ringZ12(x);
    }
}

const initString = () => {
    //使用する弦を取得
    let isCheckedFix = document.getElementById("chbx_fix").checked;
    if (isCheckedFix == false) {
        const availableStrings = new Array();
        for (let i = 1; i < 7; i++) {
            let isChecked = document.getElementById("chbx" + String(i)).checked;
            if (isChecked)
                //使用する弦番号を追加
                availableStrings.push(i);
        }

        //弦番号を乱数で選択
        qRootString = availableStrings[getRandomInt(0, availableStrings.length)];
        qRootFlet = getRandomInt(2, 6);
    }
    qString = getRandomInt(1, 7);
    while (1) {
        qFlet = getRandomInt(1, 7);
        if (qRootString != qString || qRootFlet != qFlet)
            break;
    }
};

//ルートに対して、ターゲットの位置のインデックスを返す
const calcIndex = (rootString, rootFlet, targetString, targetFlet) => {
    let result;
    if ((rootString <= 2 && targetString >= 3) || (targetString <= 2 && rootString >= 3)) {
        result = (rootString - targetString - Math.sign((rootString - targetString))) * 5 + Math.sign((rootString - targetString)) * 4 - (rootFlet - targetFlet);
    }
    else {
        result = ((rootString - targetString) * 5 - (rootFlet - targetFlet));
    }
    result = ringZ12(result);
    return result;
}

const calcFingerBoard = (rootString, rootFlet) => {
    const calcIndexFromRoot = (targetString, targetFlet) => calcIndex(rootString, rootFlet, targetString, targetFlet);
    for (let i = 0; i < 6; i++) {
        fingerBoardIndexArrays.push(new Array());
        for (let j = 0; j < 6; j++) {
            fingerBoardIndexArrays[i].push(calcIndexFromRoot(i + 1, j + 1));
        }
    }
}

const init = () => {
    document.getElementById("ans_lbl").textContent = "";
    initString();
    //答えのインデックス
    ansIndex = calcIndex(qRootString, qRootFlet, qString, qFlet);
    //指板のインデックスを全部計算
    //まずはクリア
    fingerBoardIndexArrays = [];
    calcFingerBoard(qRootString, qRootFlet);
}


//描画
const onRepaint = function () {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const distanceString = height / 7.0;
    const numFlet = 6;
    const distanceFlet = width / numFlet;

    //描画をクリア
    context.clearRect(0, 0, width, height);
    //バックグラウンドカラー
    context.fillStyle = 'rgb(255,255,200)';
    context.fillRect(0, distanceString, width, height - 2 * Math.floor(distanceString));
    //弦
    for (let i = 1; i < 7; i++) {
        context.beginPath();
        context.moveTo(0, distanceString * i);
        context.lineTo(width, distanceString * i);
        context.lineWidth = 1;
        context.stroke();
    }
    //フレット
    for (let i = 1; i < numFlet; i++) {
        context.beginPath();
        context.moveTo(distanceFlet * i, distanceString);
        context.lineTo(distanceFlet * i, height - Math.floor(distanceString));
        context.lineWidth = 5;
        context.stroke();
    }
    //フレット中心座標
    //centerOfFlets[フレット-1]
    const centerOfFlets = new Array();
    for (let i = 0; i < numFlet; i++) {
        centerOfFlets.push(distanceFlet * i + distanceFlet / 2.0);
    }

    //円
    //addCircle(中心座標x,y,半径,context, 弦感覚,フレット中心座標,色rgba)
    const radius = Math.min(distanceFlet, distanceString) * 0.4;
    const addRoot = (x, y) => addCircle(x, y, radius, context, distanceString, centerOfFlets, "rgba(0, 0, 0, 0.8)");
    const addQuestion = (x, y) => addCircle(x, y, radius, context, distanceString, centerOfFlets, "rgba(255, 0, 0, 0.8)");
    //弦、フレットで指定
    addRoot(qRootString, qRootFlet);
    addQuestion(qString, qFlet);
};

const addCircle = (stringNumber, fletNumber, radius, context, distanceString, centerOfFlets, color) => {
    context.beginPath();
    context.arc(
        centerOfFlets[fletNumber - 1], //x座標
        distanceString * stringNumber, //y座標
        radius, //半径
        0 * Math.PI / 180, //開始角度
        360 * Math.PI / 180, //終了角度
        false); //true:反時計回り　false:時計回り
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();
}

//リサイズ
const onResize = function () {

    const canvas = document.getElementById('canvas');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    onRepaint();
};

//ボタンクリック
function ans_btn_click() {
    let btn = document.getElementById("ans_btn")
    //解答表示済み
    if (isAnswered) {
        isAnswered = false;
        btn.value = "答え";
        init();
        onRepaint();
    }
    else {
        isAnswered = true;
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const distanceString = height / 7.0;
        const numFlet = 6;
        const distanceFlet = width / numFlet;
        const centerOfFlets = new Array();
        for (let i = 0; i < numFlet; i++) {
            centerOfFlets.push(distanceFlet * i + distanceFlet / 2.0);
        }
        const radius = Math.min(distanceFlet, distanceString) * 0.4;
        const addOtherRoot = (x, y) => addCircle(x, y, radius * 0.5, context, distanceString, centerOfFlets, "rgba(0, 0, 0, 0.8)");
        const add3rd = (x, y) => addCircle(x, y, radius * 0.5, context, distanceString, centerOfFlets, "rgba(255, 255, 0, 0.8)");
        const add5th = (x, y) => addCircle(x, y, radius * 0.5, context, distanceString, centerOfFlets, "rgba(0, 255, 0, 0.8)");
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                let index = fingerBoardIndexArrays[i][j];
                switch (index) {
                    case 0:
                        addOtherRoot(i + 1, j + 1);
                        break;
                    case 4:
                        add3rd(i + 1, j + 1);
                        break;
                    case 7:
                        add5th(i + 1, j + 1);
                        break;
                    default:
                }
            }
            document.getElementById("ans_lbl").textContent = degreeNames[ansIndex];
            btn.value = "次へ";
        }
    }
}

//次ボタンクリック
function next_btn_click() {
}

//イベントリスナに追加
window.addEventListener('DOMContentLoaded', onResize);
window.addEventListener('resize', onResize);

//実行
init();