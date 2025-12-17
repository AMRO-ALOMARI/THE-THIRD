// Game State
const gameState = {
    accessLevel: null, // 'limited', 'full', 'elite'
    pathsUnlocked: {
        logic: false,
        perception: false,
        choice: false,
        zero: false,
        delta: false
    },
    puzzlesSolved: {
        logic: false,
        perception: false,
        choice: false,
        zero: false,
        delta: false
    },
    collectedSymbols: [],
    silenceTimer: null,
    silenceCompleted: false
};

// Access Codes
const accessCodes = {
    "SIG-01": "limited",
    "D-11": "full",
    "YOU_NOTICED": "elite"
};

// Page Management
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
}

// Check Access Code
function checkCode() {
    const codeInput = document.getElementById('accessCode');
    const errorDiv = document.getElementById('error-message');
    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        showError('الرجاء إدخال رمز الدخول');
        return;
    }

    const accessLevel = accessCodes[code];

    if (!accessLevel) {
        showError('رمز غير صحيح');
        codeInput.value = '';
        return;
    }

    gameState.accessLevel = accessLevel;
    errorDiv.classList.add('hidden');

    if (accessLevel === 'limited') {
        alert('وصول محدود\n\nأنت الآن في المنطقة المظلمة...\nلكن المسارات لا تزال مغلقة.');
        codeInput.value = '';
    } else if (accessLevel === 'full') {
        showMainPaths();
        alert('تم فتح المسارات الظاهرة\n\nاستكشف المسارات الثلاثة...\nلكن هل هناك المزيد؟');
    } else if (accessLevel === 'elite') {
        showMainPaths(true);
        alert('تم فتح كل المسارات\n\nالمسارات الخفية الآن مرئية...\nاكتشف الحقيقة الكاملة.');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 3000);
}

function showMainPaths(showHidden = false) {
    showPage('main-paths');
    if (showHidden && gameState.accessLevel === 'elite') {
        const hiddenContainer = document.getElementById('hidden-paths-container');
        hiddenContainer.classList.remove('hidden');
    }
}

function goBack() {
    showPage('landing');
    document.getElementById('accessCode').value = '';
}

function goToMainPaths() {
    showMainPaths(gameState.accessLevel === 'elite');
}

// Path Navigation
function openPath(pathName) {
    switch(pathName) {
        case 'logic':
            showPage('path-logic');
            break;
        case 'perception':
            showPage('path-perception');
            break;
        case 'choice':
            showPage('path-choice');
            break;
        case 'zero':
            if (gameState.accessLevel === 'elite' || gameState.puzzlesSolved.choice) {
                showPage('path-zero');
                startSilenceTimer();
            } else {
                alert('هذا المسار مخفي...\nاكتشفه أولاً.');
            }
            break;
        case 'delta':
            if (gameState.accessLevel === 'elite' || gameState.puzzlesSolved.logic) {
                showPage('path-delta');
                setTimeout(() => {
                    resetDeltaPuzzle();
                }, 100);
            } else {
                alert('هذا المسار مخفي...\nحل لغز Path of Logic أولاً.');
            }
            break;
    }
}

// Path of Logic - Puzzle
function checkLogicAnswer() {
    const answer = document.getElementById('logic-answer').value.trim().toUpperCase();
    const feedback = document.getElementById('logic-feedback');

    if (answer === 'THIRD') {
        gameState.puzzlesSolved.logic = true;
        feedback.textContent = '✓ صحيح! لقد اكتشفت الحقيقة...\nPath Δ الآن مفتوح.';
        feedback.className = 'feedback success';
        feedback.classList.remove('hidden');
        
        // Unlock Path Δ
        setTimeout(() => {
            if (gameState.accessLevel !== 'elite') {
                const hiddenContainer = document.getElementById('hidden-paths-container');
                if (hiddenContainer) {
                    hiddenContainer.classList.remove('hidden');
                }
            }
            alert('Path Δ مفتوح الآن!\n\nاكتشف المسار الخفي...');
        }, 2000);
    } else {
        feedback.textContent = '✗ غير صحيح. فكر مرة أخرى...\nتلميح: أول حرف من كل فقرة.';
        feedback.className = 'feedback error';
        feedback.classList.remove('hidden');
    }
}

// Path of Perception - Puzzle
function checkPerceptionAnswer() {
    const answer = document.getElementById('perception-answer').value.trim().toUpperCase();
    const feedback = document.getElementById('perception-feedback');

    if (answer === 'Y' || answer === 'ي') {
        gameState.puzzlesSolved.perception = true;
        feedback.textContent = '✓ لاحظت...\nأنت جزء من الكود الآن.';
        feedback.className = 'feedback success';
        feedback.classList.remove('hidden');
        
        // Add to collected symbols for delta path
        if (!gameState.collectedSymbols.includes('Y')) {
            gameState.collectedSymbols.push('Y');
        }
    } else {
        feedback.textContent = '✗ فكر في السؤال مرة أخرى...\nما هو العنصر المختلف؟';
        feedback.className = 'feedback error';
        feedback.classList.remove('hidden');
    }
}

// Path of Choice
function makeChoice(choice) {
    const feedback = document.getElementById('choice-feedback');
    gameState.puzzlesSolved.choice = true;

    if (choice === 1) {
        feedback.textContent = 'لقد اخترت الاستمرار...\nالمسارات الخفية تنتظرك.';
        feedback.className = 'feedback success';
        feedback.classList.remove('hidden');
    } else {
        feedback.textContent = 'لقد اخترت الاكتشاف...\nPath Ø الآن مفتوح.';
        feedback.className = 'feedback success';
        feedback.classList.remove('hidden');
        
        // Unlock Path Ø
        setTimeout(() => {
            if (gameState.accessLevel !== 'elite') {
                const hiddenContainer = document.getElementById('hidden-paths-container');
                if (hiddenContainer) {
                    hiddenContainer.classList.remove('hidden');
                }
            }
            alert('Path Ø مفتوح الآن!\n\nالصمت ينتظرك...');
        }, 2000);
    }
}

// Path Ø - Silence Timer
function startSilenceTimer() {
    let seconds = 60;
    const timerElement = document.getElementById('silence-timer');
    const silenceBtn = document.getElementById('silence-btn');
    
    silenceBtn.disabled = true;
    gameState.silenceTimer = setInterval(() => {
        seconds--;
        timerElement.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(gameState.silenceTimer);
            silenceBtn.disabled = false;
            gameState.silenceCompleted = true;
            timerElement.textContent = '0';
            timerElement.style.color = '#FF0000';
        }
    }, 1000);
}

function completeSilence() {
    if (!gameState.silenceCompleted) {
        alert('خذ وقتك...\nالصمت يحتاج دقيقة كاملة.');
        return;
    }

    gameState.puzzlesSolved.zero = true;
    const feedback = document.getElementById('zero-feedback');
    feedback.textContent = '✓ لقد أكملت الصمت...\nأنت الآن جاهز للحقيقة.';
    feedback.className = 'feedback success';
    feedback.classList.remove('hidden');

    checkAllPuzzlesSolved();
}

// Path Δ - Collect Symbols
function resetDeltaPuzzle() {
    gameState.collectedSymbols = [];
    updateDeltaDisplay();
    document.querySelectorAll('.delta-symbol').forEach(symbol => {
        symbol.classList.remove('collected');
    });
    
    // Re-attach event listeners
    attachDeltaListeners();
}

function attachDeltaListeners() {
    document.querySelectorAll('.delta-symbol').forEach(symbol => {
        symbol.addEventListener('click', function() {
            const symbolValue = this.getAttribute('data-symbol');
            if (symbolValue && !this.classList.contains('collected')) {
                collectSymbol(symbolValue, this);
            }
        });
    });
}

function collectSymbol(symbol, element) {
    if (!element || element.classList.contains('collected')) {
        return;
    }

    gameState.collectedSymbols.push(symbol);
    element.classList.add('collected');
    updateDeltaDisplay();
    checkDeltaComplete();
}

function updateDeltaDisplay() {
    const display = document.getElementById('collected-code-display');
    if (gameState.collectedSymbols.length === 0) {
        display.textContent = '...';
    } else {
        display.textContent = gameState.collectedSymbols.join('');
    }
}

function checkDeltaComplete() {
    const targetCode = 'YOU_NOTICED';
    const currentCode = gameState.collectedSymbols.join('');

    if (currentCode === targetCode) {
        gameState.puzzlesSolved.delta = true;
        const feedback = document.getElementById('delta-feedback');
        feedback.textContent = '✓ كود الخصم مكتمل!\n\nYOU_NOTICED';
        feedback.className = 'feedback success';
        feedback.classList.remove('hidden');

        setTimeout(() => {
            checkAllPuzzlesSolved();
        }, 2000);
    } else if (targetCode.startsWith(currentCode)) {
        // Partial match - continue
    } else {
        // Wrong sequence - reset
        setTimeout(() => {
            alert('تسلسل خاطئ...\nابدأ من جديد.');
            resetDeltaPuzzle();
        }, 1000);
    }
}

// Check if all puzzles are solved
function checkAllPuzzlesSolved() {
    const requiredPuzzles = ['logic', 'perception', 'choice'];
    const allBasicSolved = requiredPuzzles.every(puzzle => gameState.puzzlesSolved[puzzle]);
    const hiddenSolved = gameState.puzzlesSolved.delta || gameState.puzzlesSolved.zero;

    if (allBasicSolved && hiddenSolved) {
        setTimeout(() => {
            showFinalPage();
        }, 2000);
    }
}

// Final Page
function showFinalPage() {
    showPage('final-page');
    const finalCode = document.getElementById('final-code');
    finalCode.textContent = 'YOU_NOTICED';
    
    // Animate code appearance
    setTimeout(() => {
        finalCode.style.animation = 'glow 1s ease-in-out infinite alternate';
    }, 500);
}

function goToStore() {
    alert('انتقل إلى المتجر واستخدم الكود:\n\nYOU_NOTICED\n\nالخصم: 44%\nالسعر الجديد: ≈ 62 ريال');
    // يمكن إضافة رابط المتجر هنا
    // window.open('https://your-store.com', '_blank');
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    const accessInput = document.getElementById('accessCode');
    if (accessInput) {
        accessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkCode();
            }
        });
    }

    const logicInput = document.getElementById('logic-answer');
    if (logicInput) {
        logicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkLogicAnswer();
            }
        });
    }

    const perceptionInput = document.getElementById('perception-answer');
    if (perceptionInput) {
        perceptionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPerceptionAnswer();
            }
        });
    }
    
    // Attach delta symbol listeners on page load
    attachDeltaListeners();
});

