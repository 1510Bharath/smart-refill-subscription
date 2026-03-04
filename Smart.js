let subscriptions=[];
let selectedProduct="";
let selectedFrequency=15;
let editIndex=null;

/* SCREEN SWITCH */
function goTo(id){
document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
render();
}

/* SUBSCRIBE */
function subscribe(product){
selectedProduct=product;
editIndex=null;
document.getElementById("modalTitle").innerText="Subscribe to "+product;
document.getElementById("modal").classList.add("active");
}

function selectFreq(el,freq){
document.querySelectorAll(".freq-option").forEach(e=>e.classList.remove("active"));
el.classList.add("active");
selectedFrequency=freq;
}

function confirmModify(){
if(editIndex===null){
subscriptions.push({
name:selectedProduct,
frequency:selectedFrequency,
status:"Active",
lastDelivery:new Date()
});
showToast("Subscription Added!");
}else{
subscriptions[editIndex].frequency=selectedFrequency;
showToast("Frequency Updated!");
}
closeModal();
render();
goTo("dashboard");
}

function closeModal(){
document.getElementById("modal").classList.remove("active");
}

/* DASHBOARD */
function render(){
let list=document.getElementById("subscriptionList");
if(list){
list.innerHTML="";
subscriptions.forEach((sub,index)=>{

let nextDate=calculateNextDate(sub.frequency,sub.lastDelivery);
let prediction=smartPrediction(sub.frequency);

let toggleBtn=sub.status==="Paused"
? `<button class="orange" onclick="toggleStatus(${index})">Activate</button>`
: `<button class="orange" onclick="toggleStatus(${index})">Pause</button>`;

list.innerHTML+=`
<div class="card">
<h4>${sub.name}</h4>
<p>Frequency: ${sub.frequency} Days</p>
<p>Status: ${sub.status}</p>
<p>Next Delivery: <strong>${nextDate}</strong></p>
<span class="badge">${prediction}</span><br>
<button class="blue" onclick="editSub(${index})">Modify</button>
<button class="green" onclick="skipDelivery(${index})">Skip</button>
${toggleBtn}
<button class="red" onclick="cancelSub(${index})">Cancel</button>
</div>
`;
});
}

document.getElementById("activeCount").innerText=
subscriptions.filter(s=>s.status==="Active").length;
}

/* MODIFY */
function editSub(index){
editIndex=index;
selectedFrequency=subscriptions[index].frequency;
document.getElementById("modalTitle").innerText="Modify "+subscriptions[index].name;
document.getElementById("modal").classList.add("active");
}

/* DATE LOGIC */
function calculateNextDate(freq,lastDate){
let base=new Date(lastDate);
base.setDate(base.getDate()+parseInt(freq));
return base.toDateString();
}

/* SMART PREDICTION */
function smartPrediction(freq){
if(freq<=15) return "  High Usage";
if(freq<=30) return " Moderate Usage";
return " Long-Term Item";
}

/* SKIP */
function skipDelivery(index){
subscriptions[index].lastDelivery=new Date();
showToast("Delivery Skipped!");
render();
}

/* TOGGLE */
function toggleStatus(index){
subscriptions[index].status=
subscriptions[index].status==="Paused"?"Active":"Paused";
showToast("Status Updated!");
render();
}

/* CANCEL */
function cancelSub(index){
subscriptions.splice(index,1);
showToast("Subscription Cancelled");
render();
}

/* TOAST */
function showToast(msg){
let toast=document.getElementById("toast");
toast.innerText=msg;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),3000);
}

/* REMINDER RENDER */
function renderReminder(){

    let reminderList=document.getElementById("reminderList");
    if(!reminderList) return;
    
    reminderList.innerHTML="";
    
    subscriptions.forEach((sub,index)=>{
    
    let today=new Date();
    let last=new Date(sub.lastDelivery);
    let usedDays=Math.floor((today-last)/(1000*60*60*24));
    let daysLeft=sub.frequency-usedDays;
    
    if(daysLeft<0) daysLeft=0;
    
    let usagePercent=(usedDays/sub.frequency)*100;
    if(usagePercent>100) usagePercent=100;
    
    let statusText="";
    let statusClass="safe";
    
    if(daysLeft<=3){
    statusText="Low Stock – Refill Soon!";
    statusClass="low";
    simulateNotification(sub.name);
    }else{
    statusText="Stock Sufficient";
    }
    
    reminderList.innerHTML+=`
    <div class="card">
    <h4>${sub.name}</h4>
    <p>Days Left: <strong>${daysLeft}</strong></p>
    <p class="${statusClass}">${statusText}</p>
    
    <div class="progress-container">
    <div class="progress-bar" style="width:${usagePercent}%"></div>
    </div>
    
    </div>
    `;
    
    });
    
    }
    
    /* SIMULATED NOTIFICATION */
    function simulateNotification(product){
    showToast("🔔 Reminder: "+product+" is running low!");
    }
    
    /* UPDATE REMINDER WHEN NAVIGATING */
    function goTo(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    render();
    renderReminder();
    }