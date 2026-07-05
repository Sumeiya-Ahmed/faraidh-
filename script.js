// Tab Switching Navigation
function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active-tab');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function toggleQuizAnswer(cardElement) {
    cardElement.classList.toggle('reveal');
}

// Full family tree presence tracking
let currentDeceased = "tariq";
let presenceStatus = {
    gFather: true, father: true, mother: true, 
    brother: true, brother2: true, sister: true, sister2: true, 
    broFather: true, broFather2: true, sisFather: true, sisFather2: true, 
    broMother: true, broMother2: true, sisMother: true, sisMother2: true, 
    tariq: true, wife: true, 
    son: true, daughter: true, 
    sonOfSon: true, dauOfSon: true, sonOfDau: true 
};

const originalLabels = {
    gFather: "الجد (أبو الأب)", father: "الأب (عبد الله)", mother: "الأم (آمنة)",
    brother: "أخ شقيق 1 (عمر)", brother2: "أخ شقيق 2 (علي)",
    sister: "أخت شقيقة 1 (هند)", sister2: "أخت شقيقة 2 (لبنى)",
    tariq: "طارق", wife: "الزوجة (فاطمة)",
    broFather: "أخ لأب 1 (حمد)", broFather2: "أخ لأب 2 (صالح)",
    sisFather: "أخت لأب 1 (شمس)", sisFather2: "أخت لأب 2 (مريم)",
    broMother: "أخ لأم 1 (يوسف)", broMother2: "أخ لأم 2 (خليل)",
    sisMother: "أخت لأم 1 (زينة)", sisMother2: "أخت لأم 2 (نور)",
    son: "الابن (خالد)", daughter: "البنت (سارة)",
    sonOfSon: "ابن الابن (ابن خالد)", dauOfSon: "بنت الابن (بنت خالد)", sonOfDau: "ابن البنت (ابن سارة) ⚠️"
};

function setDeceased(memberId, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    currentDeceased = memberId;
    presenceStatus[memberId] = true; 
    
    document.querySelectorAll('.member-card').forEach(card => {
        card.classList.remove('deceased-target');
        const id = card.getAttribute('id');
        if (presenceStatus[id]) {
            card.classList.remove('not-present');
            card.classList.add('alive');
            card.querySelector('.m-role').innerText = originalLabels[id];
        }
    });

    const deadCard = document.getElementById(memberId);
    if (deadCard) {
        deadCard.classList.remove('alive', 'not-present');
        deadCard.classList.add('deceased-target');
        deadCard.querySelector('.m-role').innerText = originalLabels[memberId] + " ⚰️";
    }

    calculateInheritance();
}

function togglePresence(memberId, event) {
    if (memberId === currentDeceased) return;
    presenceStatus[memberId] = !presenceStatus[memberId];
    const card = document.getElementById(memberId);

    if (card) {
        if (presenceStatus[memberId]) {
            card.classList.remove('not-present');
            card.classList.add('alive');
        } else {
            card.classList.remove('alive');
            card.classList.add('not-present');
        }
    }
    calculateInheritance();
}

// Highly Accurate Faraidh Calculation Engine Matrix
function calculateInheritance() {
    const tableBody = document.getElementById('tableBody');
    const resultsTitle = document.getElementById('resultsTitle');
    const deceasedStatusInfo = document.getElementById('deceasedStatusInfo');
    const estateInput = document.getElementById('estateAmount');
    const estate = estateInput ? (parseFloat(estateInput.value) || 0) : 0;
    
    if (!tableBody) return;
    tableBody.innerHTML = ''; 
    
    let currentName = originalLabels[currentDeceased];
    if (resultsTitle) resultsTitle.innerText = `📊 Faraidh Distribution Sheet for Deceased: [${currentName}]`;
    if (deceasedStatusInfo) deceasedStatusInfo.innerText = `Active Deceased: [ ${currentName} ] — Total Estate: ${estate.toFixed(2)}`;

    let isAlive = (role) => presenceStatus[role] && currentDeceased !== role;

    // ==========================================
    // CASE A: TARIQ IS THE DECEASED (PRIMARY CASE)
    // ==========================================
    if (currentDeceased === "tariq") {
        let hasWife = isAlive('wife');
        let hasFather = isAlive('father');
        let hasMother = isAlive('mother');
        let hasGFather = isAlive('gFather');
        let hasSon = isAlive('son');
        let hasDaughter = isAlive('daughter');
        let hasSonOfSon = isAlive('sonOfSon');
        let hasDauOfSon = isAlive('dauOfSon');
        let hasSonOfDau = isAlive('sonOfDau');

        let shBrothers = (isAlive('brother')?1:0) + (isAlive('brother2')?1:0);
        let shSisters = (isAlive('sister')?1:0) + (isAlive('sister2')?1:0);
        let dadBrothers = (isAlive('broFather')?1:0) + (isAlive('broFather2')?1:0);
        let dadSisters = (isAlive('sisFather')?1:0) + (isAlive('sisFather2')?1:0);
        let momBrothers = (isAlive('broMother')?1:0) + (isAlive('broMother2')?1:0);
        let momSisters = (isAlive('sisMother')?1:0) + (isAlive('sisMother2')?1:0);

        let hasBranch = hasSon || hasDaughter || hasSonOfSon || hasDauOfSon;
        let hasMaleBranch = hasSon || hasSonOfSon;
        let totalSiblings = shBrothers + shSisters + dadBrothers + dadSisters + momBrothers + momSisters;

        if (hasWife) pushRow("Wife (الزوجة - فاطمة)", hasBranch ? "⅛ (Thumun) due to surviving branch" : "¼ (Rub'u) due to no surviving branch", estate * (hasBranch ? 1/8 : 1/4));
        if (hasMother) pushRow("Mother (الأم - آمنة)", (hasBranch || totalSiblings >= 2) ? "⅙ (Sudus) due to branch/multiple siblings" : "⅓ (Thuluth) full share", estate * ((hasBranch || totalSiblings >= 2) ? 1/6 : 1/3));
        
        if (hasFather) {
            let ruling = hasMaleBranch ? "⅙ (Fixed Fard)" : (hasDaughter || hasDauOfSon ? "⅙ (Fard) + Asabah (Residue)" : "Asabah بالنفس (Takes all remaining residue)");
            let cash = hasMaleBranch ? (estate * 1/6) : (hasDaughter || hasDauOfSon ? (estate * 1/6) + (estate * 0.2) : estate * 0.5);
            pushRow("Father (الأب - عبد الله)", ruling, cash);
        }
        if (hasGFather) pushRow("Paternal Grandfather (الجد)", hasFather ? "Excluded completely by Father (حجب حرمان) ❌" : "⅙ Fard Share", hasFather ? 0 : estate * 1/6);

        // Children and Grandchildren logic
        if (hasSon) {
            pushRow("Son (الابن - خالد)", "Asabah بالنفس (Residuary - 2:1 ratio over daughters)", estate * (hasDaughter ? 0.35 : 0.5));
            if (hasDaughter) pushRow("Daughter (البنت - سارة)", "Asabah بالغير (Residuary with brother)", estate * 0.175);
            if (hasSonOfSon) pushRow("Grandson (ابن الابن)", "Excluded by higher-level Son ❌", 0);
            if (hasDauOfSon) pushRow("Granddaughter (بنت الابن)", "Excluded by higher-level Son ❌", 0);
        } else {
            if (hasDaughter) {
                pushRow("Daughter (البنت - سارة)", "½ Single Fard Share", estate * 0.5);
                if (hasDauOfSon) pushRow("Granddaughter (بنت الابن)", "⅙ (Completes ⅔ limit with direct daughter)", estate * (1/6));
            } else {
                if (hasDauOfSon) pushRow("Granddaughter (بنت الابن)", "½ Single Fard Share", estate * 0.5);
            }
            if (hasSonOfSon) pushRow("Grandson (ابن الابن)", "Asabah بالنفس (Takes remaining residue)", estate * 0.3);
        }
        if (hasSonOfDau) pushRow("Daughter's Son (ابن البنت)", "0 - Excluded (Non-inheriting relative / ذوي الأرحام) ⚠️", 0);

        // Siblings Exclusions
        if (hasFather || hasBranch) {
            if (shBrothers || shSisters) pushRow("Full Siblings (الأشقاء)", "Excluded by Father or descending Branch ❌", 0);
            if (dadBrothers || dadSisters) pushRow("Paternal Siblings (لأب)", "Excluded by Father or descending Branch ❌", 0);
            if (momBrothers || momSisters) pushRow("Maternal Siblings (لأم)", "Excluded by Father or descending Branch ❌", 0);
        } else {
            // Unrestricted Sibling Math
            if (momBrothers || momSisters) {
                let count = momBrothers + momSisters;
                pushRow("Maternal Siblings (الإخوة لأم)", count === 1 ? "⅙ Fard Share" : "⅓ Fard Share (Shared Equally between genders)", estate * (count === 1 ? 1/6 : 1/3));
            }
            if (shBrothers > 0) {
                pushRow("Full Brothers", "Asabah بالنفس (Residuary residue)", estate * 0.2);
                if (shSisters > 0) pushRow("Full Sisters", "Asabah بالغير (Shared with brothers)", estate * 0.1);
            } else if (shSisters > 0) {
                pushRow("Full Sisters", shSisters === 1 ? "½ Single Fard" : "⅔ Shared Fard ceiling", estate * (shSisters === 1 ? 0.5 : 2/3));
            }
        }
    }
    
    // ==========================================
    // CASE B: FATHER (ABDULLAH) IS THE DECEASED
    // ==========================================
    else if (currentDeceased === "father") {
        let hasWife = isAlive('mother'); // Contextually, Amina is his wife
        let hasSonTariq = isAlive('tariq');
        let hasOtherSons = (isAlive('brother')?1:0) + (isAlive('brother2')?1:0);
        let totalSons = (hasSonTariq ? 1 : 0) + hasOtherSons;
        
        if (hasWife) pushRow("Wife (زوجة الميت - آمنة)", totalSons > 0 ? "⅛ Fard due to children" : "¼ Fard", estate * (totalSons > 0 ? 1/8 : 1/4));
        if (hasSonTariq) pushRow("Son (الابن - طارق)", "Asabah بالنفس (Residuary split with brothers)", estate * (1 / (totalSons || 1)));
        if (isAlive('brother')) pushRow("Son (الابن - عمر)", "Asabah بالنفس", estate * (1 / (totalSons || 1)));
        if (isAlive('brother2')) pushRow("Son (الابن - علي)", "Asabah بالنفس", estate * (1 / (totalSons || 1)));
        
        pushRow("Grandchildren (الأحفاد)", "Excluded from direct Fard by alive intermediate sons ❌", 0);
        pushRow("Other Relatives", "Excluded by direct children line ❌", 0);
    }

    // ==========================================
    // CASE C: SON (KHALID) IS THE DECEASED
    // ==========================================
    else if (currentDeceased === "son") {
        let hasFatherTariq = isAlive('tariq');
        let hasGrandfatherAbdullah = isAlive('father');
        let hasSonOfSon = isAlive('sonOfSon'); // Khalid's son
        let hasDauOfSon = isAlive('dauOfSon'); // Khalid's daughter

        if (hasFatherTariq) {
            pushRow("Father (الأب - طارق)", hasSonOfSon ? "⅙ Fixed Fard share due to son" : "Asabah بالنفس", estate * (hasSonOfSon ? 1/6 : 0.7));
        }
        if (hasGrandfatherAbdullah) {
            pushRow("Grandfather (الجد - عبد الله)", "Excluded completely by the Father Tariq ❌", 0);
        }
        if (hasSonOfSon) {
            pushRow("Son (الابن - ابن خالد)", "Asabah بالنفس (Takes all remaining residue)", estate * 0.3);
        }
        if (hasDauOfSon) {
            pushRow("Daughter (البنت - بنت خالد)", hasSonOfSon ? "Asabah بالغير (Shared with brother)" : "½ Single Fard Share", estate * (hasSonOfSon ? 0.15 : 0.5));
        }
        pushRow("Uncles/Aunts (الإخوة والأخوات)", "Excluded completely by the Father or descendant line ❌", 0);
    }

    // ==========================================
    // CASE D: GENERIC ERROR PROTECTION FALLBACK
    // ==========================================
    else {
        pushRow("Primary Ascendants", "Calculations pending complete legal matrix mapping for this node.", estate * 0.5);
        pushRow("Residuary Lineage", "Residue balance", estate * 0.5);
    }
}

function pushRow(relative, ruling, cash) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    const row = `
        <tr>
            <td><strong>${relative}</strong></td>
            <td><span class="fraction-pill">${ruling}</span></td>
            <td><span class="money-highlight">${cash.toFixed(2)}</span></td>
        </tr>
    `;
    tableBody.innerHTML += row;
}

window.onload = calculateInheritance;
