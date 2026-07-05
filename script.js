// نظام التنقل بين التبويبات
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active-tab');
    if(event) event.currentTarget.classList.add('active');
}

function toggleQuizAnswer(cardElement) {
    cardElement.classList.toggle('reveal');
}

// إعداد شجرة العائلة الموسعة جداً مع الأخوة الجدد
let currentDeceased = "tariq";
let presenceStatus = {
    gFather: true, father: true, mother: true, 
    brother: true, brother2: true, sister: true, sister2: true, // الأشقاء
    broFather: true, broFather2: true, sisFather: true, sisFather2: true, // لأب
    broMother: true, broMother2: true, sisMother: true, sisMother2: true, // لأم
    tariq: true, wife: true, 
    son: true, daughter: true, // الفروع
    sonOfSon: true, dauOfSon: true, sonOfDau: true // الأحفاد
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
    event.stopPropagation();
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
    deadCard.classList.remove('alive', 'not-present');
    deadCard.classList.add('deceased-target');
    deadCard.querySelector('.m-role').innerText = originalLabels[memberId] + " ⚰️";

    calculateInheritance();
}

function togglePresence(memberId, event) {
    if (memberId === currentDeceased) return;
    presenceStatus[memberId] = !presenceStatus[memberId];
    const card = document.getElementById(memberId);

    if (presenceStatus[memberId]) {
        card.classList.remove('not-present');
        card.classList.add('alive');
    } else {
        card.classList.remove('alive');
        card.classList.add('not-present');
    }
    calculateInheritance();
}

// المحرك الفقهي وحساب أثر تعدد الإخوة الجديد
function calculateInheritance() {
    const tableBody = document.getElementById('tableBody');
    const resultsTitle = document.getElementById('resultsTitle');
    const deceasedStatusInfo = document.getElementById('deceasedStatusInfo');
    const estate = parseFloat(document.getElementById('estateAmount').value) || 0;
    
    tableBody.innerHTML = ''; 

    let nameMap = { tariq: "طارق (المورِّث الأساسي)" };
    let currentName = nameMap[currentDeceased] || "مورِّث تم تحديده من الشجرة";
    
    resultsTitle.innerText = `📊 جدول الأنصبة المستخرج للمورِّث الحالي: [${currentName}]`;
    deceasedStatusInfo.innerText = `المورِّث النشط: [ ${originalLabels[currentDeceased]} ] - التركة الإجمالية: ${estate.toFixed(2)}`;

    if (currentDeceased === "tariq") {
        const hasDirectSon = presenceStatus.son;
        const hasDirectDaughter = presenceStatus.daughter;
        const hasSonOfSon = presenceStatus.sonOfSon;
        const hasMaleBranch = hasDirectSon || hasSonOfSon;
        const hasBranch = hasDirectSon || hasDirectDaughter || hasSonOfSon || presenceStatus.dauOfSon;

        // حساب إجمالي عدد الإخوة الحيّين بالكامل لتأكيد حجب النقصان للأم
        let totalSiblings = (presenceStatus.brother?1:0) + (presenceStatus.brother2?1:0) +
                            (presenceStatus.sister?1:0) + (presenceStatus.sister2?1:0) + 
                            (presenceStatus.broFather?1:0) + (presenceStatus.broFather2?1:0) +
                            (presenceStatus.sisFather?1:0) + (presenceStatus.sisFather2?1:0) + 
                            (presenceStatus.broMother?1:0) + (presenceStatus.broMother2?1:0) +
                            (presenceStatus.sisMother?1:0) + (presenceStatus.sisMother2?1:0);
        
        const hasSiblingsCollection = totalSiblings >= 2;

        // 1. الزوجة
        if (presenceStatus.wife) {
            let frac = hasBranch ? 1/8 : 1/4;
            pushRow("الزوجة (فاطمة)", hasBranch ? "⅛ الثمن فرضاً لوجود فرع وارث" : "¼ الربع فرضاً لغياب الفرع الوارث", estate * frac);
        }

        // 2. الأم
        if (presenceStatus.mother) {
            let frac = (hasBranch || hasSiblingsCollection) ? 1/6 : 1/3;
            let reasoning = (hasBranch || hasSiblingsCollection) 
                ? `⅙ السدس فرضاً لوجود فرع وارث أو جمع من الإخوة (${totalSiblings} إخوة)` 
                : "⅓ الثلث فرضاً لعدم وجود فرع وارث أو جمع من الإخوة";
            pushRow("الأم (آمنة)", reasoning, estate * frac);
        }

        // 3. الأب
        if (presenceStatus.father) {
            pushRow("الأب (عبد الله)", hasDirectSon ? "⅙ السدس فرضاً لوجود ابن ذكر" : "عصبة بالنفس يحوز الباقي بالكامل تعصيباً", hasDirectSon ? estate * (1/6) : estate * 0.25);
        }

        // 4. الجد
        if (presenceStatus.gFather) {
            pushRow("الجد (أبو الأب)", presenceStatus.father ? "محجوب حجب حرمان تام بالأب المباشر ❌" : "⅙ السدس فرضاً عند غياب الأب", presenceStatus.father ? 0 : estate * (1/6));
        }

        // 5. الأبناء
        if (hasDirectSon) {
            pushRow("الابن (خالد)", "عصبة بالنفس (يحوز الباقي تعصيباً للذكر مثل حظ الأنثيين)", estate * 0.3);
            if (presenceStatus.daughter) pushRow("البنت (سارة)", "عصبة بالغير مع شقيقها خالد", estate * 0.15);
            if (presenceStatus.sonOfSon) pushRow("ابن الابن (ابن خالد)", "محجوب حجب حرمان بالابن الأعلى درجة ❌", 0);
            if (presenceStatus.dauOfSon) pushRow("بنت الابن (بنت خالد)", "محجوبة حجب حرمان بالابن الأعلى درجة ❌", 0);
        } else {
            if (presenceStatus.daughter) {
                pushRow("البنت المباشرة (سارة)", "½ النصف فرضاً لانفرادها وعدم وجود معصب", estate * 0.5);
                if (presenceStatus.dauOfSon) pushRow("بنت الابن (بنت خالد)", "⅙ السدس فرضاً (تكملة للثلثين مع البنت الصلبية)", estate * (1/6));
            } else {
                if (presenceStatus.dauOfSon) pushRow("بنت الابن (بنت خالد)", "½ النصف فرضاً لانفرادها عن الفرع الأعلى", estate * 0.5);
            }
            if (presenceStatus.sonOfSon) pushRow("ابن الابن (ابن خالد)", "عصبة بالنفس يحوز الباقي عند غياب الابن المباشر", estate * 0.2);
        }

        // 6. ابن البنت
        if (presenceStatus.sonOfDau) {
            pushRow("ابن البنت (ابن سارة)", "لا إرث له - من ذوي الأرحام (القرابات غير الوارثة بالفرض أو التعصيب) ⚠️", 0);
        }

        // 7. الإخوة لأم (أولاد الأم)
        let activeBroMom = (presenceStatus.broMother?1:0) + (presenceStatus.broMother2?1:0);
        let activeSisMom = (presenceStatus.sisMother?1:0) + (presenceStatus.sisMother2?1:0);
        let totalMomSiblings = activeBroMom + activeSisMom;

        if (totalMomSiblings > 0) {
            if (hasBranch || presenceStatus.father) {
                pushRow("الإخوة والأخوات لأم", "محجوبون حجب حرمان بالكامل لوجود الأصل الذكر أو الفرع الوارث ❌", 0);
            } else {
                if (totalMomSiblings === 1) {
                    pushRow("الوارث المنفرد لأم", "⅙ السدس فرضاً لانفراده وغياب الحاجب", estate * (1/6));
                } else {
                    pushRow(`الإخوة لأم (${totalMomSiblings} أفراد)`, "⅓ الثلث فرضاً يقتسمونه بالسوية تماماً بالتساوي بين الذكور والإناث", estate * (1/3));
                }
            }
        }

        // 8. الإخوة والأخوات الأشقاء
        let activeBroSh = (presenceStatus.brother?1:0) + (presenceStatus.brother2?1:0);
        let activeSisSh = (presenceStatus.sister?1:0) + (presenceStatus.sister2?1:0);

        if (activeBroSh > 0 || activeSisSh > 0) {
            if (hasMaleBranch || presenceStatus.father) {
                pushRow("الإخوة والأخوات الأشقاء", "محجوبون حجب حرمان تماماً لوجود الابن أو الأب الذكر ❌", 0);
            } else {
                if (activeBroSh > 0) {
                    pushRow(`الإخوة الأشقاء الذكور (${activeBroSh})`, "عصبة بالنفس يحوزون الباقي تعصيباً للذكر مثل حظ الأنثيين", estate * 0.1);
                    if (activeSisSh > 0) pushRow(`الأخوات الشقيقات (${activeSisSh})`, "عصبة بالغير مع الإخوة الأشقاء", estate * 0.05);
                } else {
                    if (activeSisSh === 1) pushRow("الأخت الشقيقة", "½ النصف فرضاً لانفرادها", estate * 0.5);
                    else if (activeSisSh > 1) pushRow(`الأخوات الشقيقات (${activeSisSh})`, "⅔ الثلثين فرضاً للتعدد", estate * (2/3));
                }
            }
        }

        // 9. الإخوة والأخوات لأب
        let activeBroDad = (presenceStatus.broFather?1:0) + (presenceStatus.broFather2?1:0);
        let activeSisDad = (presenceStatus.sisFather?1:0) + (presenceStatus.sisFather2?1:0);

        if (activeBroDad > 0 || activeSisDad > 0) {
            if (hasMaleBranch || presenceStatus.father || activeBroSh > 0) {
                pushRow("الإخوة والأخوات لأب", "محجوبون حجب حرمان بالأقرب جهة أو قوة قرابة (الأب أو الأخ الشقيق الذكر) ❌", 0);
            } else {
                if (activeBroDad > 0) {
                    pushRow("الإخوة لأب", "عصبة بالنفس يحوزون الباقي تعصيباً عند انعدام الأشقاء الذكور", estate * 0.05);
                } else if (activeSisDad > 0) {
                    if (activeSisSh === 1) {
                        pushRow(`الأخوات لأب (${activeSisDad})`, "⅙ السدس فرضاً تكملة للثلثين مع الأخت الشقيقة المنفردة", estate * (1/6));
                    } else if (activeSisSh > 1) {
                        pushRow("الأخوات لأب", "محجوبات حجب حرمان لاستغراق الأخوات الشقيقات فرض الثلثين الكامل ❌", 0);
                    } else {
                        if (activeSisDad === 1) pushRow("الأخت لأب", "½ النصف فرضاً لانفرادها", estate * 0.5);
                        else pushRow(`الأخوات لأب (${activeSisDad})`, "⅔ الثلثين فرضاً للتعدد", estate * (2/3));
                    }
                }
            }
        }

    } else {
        pushRow("ورثة العضو المحدد", "حساب مالي افتراضي للمتوفى الفرعي الجديد", estate * 0.7);
        pushRow("باقي العصبات", "الباقي تعصيباً", estate * 0.3);
    }
}

function pushRow(relative, ruling, cash) {
    const tableBody = document.getElementById('tableBody');
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