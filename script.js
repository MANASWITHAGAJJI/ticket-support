/* Ticket Hub - frontend demo. Data is saved in browser localStorage. */
"use strict";

const STORAGE_KEY = "tickethub_data_v1";
const initialData = {
  tickets: [
    {id:1001,subject:"Unable to access my account",description:"I have been trying to sign in since this morning. The page keeps showing an unexpected error.",customer:"John Smith",email:"john.smith@example.com",category:"Account",priority:"High",status:"In Progress",assignee:"Alice Johnson",createdAt:"2026-11-15T09:30:00.000Z",messages:[{sender:"John Smith",text:"I cannot sign in to my account.",time:"Nov 15, 9:30 AM"},{sender:"Alice Johnson",text:"Hi John, I am checking this issue and will update you shortly.",time:"Nov 15, 10:10 AM"}]},
    {id:1002,subject:"Request for dark mode",description:"It would be great to have a dark theme option in the customer dashboard.",customer:"Sarah Lee",email:"sarah.lee@example.com",category:"Feature Request",priority:"Low",status:"New",assignee:"Unassigned",createdAt:"2026-11-16T12:00:00.000Z",messages:[]},
    {id:1003,subject:"Payment receipt not received",description:"My payment was successful, but I have not received the receipt by email.",customer:"David Miller",email:"david.miller@example.com",category:"Billing",priority:"Critical",status:"On Hold",assignee:"Bob Williams",createdAt:"2026-11-16T08:45:00.000Z",messages:[{sender:"David Miller",text:"Please send me the receipt for my last payment.",time:"Nov 16, 8:45 AM"}]},
    {id:1004,subject:"Page loads very slowly",description:"The reports page takes more than a minute to load on my account.",customer:"Priya Kumar",email:"priya.kumar@example.com",category:"Technical",priority:"Medium",status:"Resolved",assignee:"Alice Johnson",createdAt:"2026-11-13T10:00:00.000Z",messages:[{sender:"Priya Kumar",text:"The reports page is very slow.",time:"Nov 13, 10:00 AM"},{sender:"Alice Johnson",text:"We optimized the report query. Please try again.",time:"Nov 14, 2:15 PM"}]},
    {id:1005,subject:"Update account email address",description:"I need help changing the email address associated with my profile.",customer:"Arun Rao",email:"arun.rao@example.com",category:"Account",priority:"Medium",status:"Closed",assignee:"Bob Williams",createdAt:"2026-11-12T14:00:00.000Z",messages:[]}
  ],
  agents:[
    {id:1,name:"Alice Johnson",email:"alice@tickethub.demo",department:"Technical Support"},
    {id:2,name:"Bob Williams",email:"bob@tickethub.demo",department:"Customer Service"},
    {id:3,name:"Nina Patel",email:"nina@tickethub.demo",department:"Billing Support"}
  ],
  articles:[
    {id:1,title:"How to reset your password",category:"Account",content:"Open the sign-in page and select “Forgot password?”. Enter your registered email address and follow the secure reset link sent to your inbox."},
    {id:2,title:"Where can I find my invoices?",category:"Billing",content:"Sign in to your account, open Settings, and select Billing. Your invoices and payment history are available in the billing section."},
    {id:3,title:"Troubleshooting sign-in issues",category:"Technical",content:"Check your internet connection, confirm that your email is correct, and clear your browser cache. If the issue continues, create a support ticket."},
    {id:4,title:"How do I contact support?",category:"General",content:"Create a ticket from the Ticket Hub dashboard. Include a clear subject, description, and your contact email so the team can respond."}
  ]
};

let data = loadData();
let currentTicketId = null;
let toastTimer = null;

function loadData(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved) return structuredClone(initialData);
    const parsed = JSON.parse(saved);
    if(!parsed || !Array.isArray(parsed.tickets) || !Array.isArray(parsed.agents) || !Array.isArray(parsed.articles)) return structuredClone(initialData);
    return parsed;
  }catch(error){ console.warn("Could not load saved data:", error); return structuredClone(initialData); }
}
function saveData(){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(error){console.warn("Could not save data:",error);} }
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function initials(name){return String(name).split(/\s+/).map(part=>part[0]||"").slice(0,2).join("").toUpperCase();}
function dateLabel(value){const date=new Date(value);return Number.isNaN(date.getTime())?"—":date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function statusClass(value){return "status-"+value.toLowerCase().replace(/\s+/g,"-");}
function priorityClass(value){return "priority-"+value.toLowerCase();}
function statusBadge(value){return `<span class="status ${statusClass(value)}">${escapeHTML(value)}</span>`;}
function priorityBadge(value){return `<span class="priority ${priorityClass(value)}">${escapeHTML(value)}</span>`;}
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);}
function getAgentOptions(selected="Unassigned"){return `<option ${selected==="Unassigned"?"selected":""}>Unassigned</option>`+data.agents.map(agent=>`<option ${selected===agent.name?"selected":""}>${escapeHTML(agent.name)}</option>`).join("");}
function activeCount(){return data.tickets.filter(ticket=>!["Resolved","Closed"].includes(ticket.status)).length;}
function navigate(page){const valid=["dashboard","tickets","create","detail","knowledge","agents","reports"];if(!valid.includes(page))page="dashboard";document.querySelectorAll(".page").forEach(el=>el.classList.remove("active"));const target=document.getElementById("page-"+page);if(target)target.classList.add("active");document.querySelectorAll(".nav-link").forEach(link=>link.classList.toggle("active",link.dataset.page===page));const labels={dashboard:"Dashboard",tickets:"All tickets",create:"Create ticket",detail:"Ticket details",knowledge:"Knowledge base",agents:"Agents",reports:"Reports"};document.getElementById("breadcrumbPage").textContent=labels[page];document.getElementById("sidebar").classList.remove("open");if(page==="tickets")renderTickets();if(page==="dashboard")renderDashboard();if(page==="agents")renderAgents();if(page==="knowledge")renderKnowledge();if(page==="reports")renderReports();window.location.hash=page==="detail"?"ticket-"+currentTicketId:page;}
function refresh(){saveData();renderDashboard();renderTickets();renderAgentSelects();renderAgents();renderKnowledge();renderReports();}
function renderDashboard(){
  const total=data.tickets.length,open=activeCount(),progress=data.tickets.filter(t=>t.status==="In Progress").length,resolved=data.tickets.filter(t=>t.status==="Resolved").length;
  document.getElementById("statTotal").textContent=total;document.getElementById("statOpen").textContent=open;document.getElementById("statProgress").textContent=progress;document.getElementById("statResolved").textContent=resolved;document.getElementById("navTicketCount").textContent=total;
  document.getElementById("overviewAgents").textContent=data.agents.length;document.getElementById("overviewArticles").textContent=data.articles.length;document.getElementById("overviewRate").textContent=(total?Math.round(resolved/total*100):0)+"%";
  const recent=[...data.tickets].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  document.getElementById("recentTickets").innerHTML=recent.length?recent.map(t=>`<tr><td><a class="ticket-link" href="#ticket-${t.id}" data-ticket="${t.id}">${escapeHTML(t.subject)}</a><div class="ticket-id">#${t.id}</div></td><td class="customer-cell">${escapeHTML(t.customer)}</td><td>${priorityBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${escapeHTML(t.assignee)}</td></tr>`).join(""):`<tr><td colspan="5">No tickets yet. Create your first ticket.</td></tr>`;
  const priorities=["Critical","High","Medium","Low"],colors={Critical:"#e45b70",High:"#e89557",Medium:"#e4bd54",Low:"#6b9ce5"};
  document.getElementById("priorityChart").innerHTML=priorities.map(p=>{const count=data.tickets.filter(t=>t.priority===p).length;const width=total?count/total*100:0;return `<div class="priority-row"><span>${p}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${colors[p]}"></div></div><strong>${count}</strong></div>`;}).join("");
}
function filteredTickets(){
  const query=(document.getElementById("ticketSearch")?.value||"").trim().toLowerCase(),status=document.getElementById("statusFilter")?.value||"",priority=document.getElementById("priorityFilter")?.value||"",assignee=document.getElementById("assigneeFilter")?.value||"";
  return data.tickets.filter(t=>(!query||[t.subject,t.customer,String(t.id),t.email].some(v=>String(v).toLowerCase().includes(query)))&&(!status||t.status===status)&&(!priority||t.priority===priority)&&(!assignee||t.assignee===assignee)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
function renderTickets(){
  const assigneeFilter=document.getElementById("assigneeFilter");if(assigneeFilter){const value=assigneeFilter.value;assigneeFilter.innerHTML='<option value="">All agents</option>'+data.agents.map(a=>`<option ${value===a.name?"selected":""}>${escapeHTML(a.name)}</option>`).join("");}
  const rows=filteredTickets();const tbody=document.getElementById("ticketRows");if(!tbody)return;
  tbody.innerHTML=rows.length?rows.map(t=>`<tr><td><a href="#ticket-${t.id}" class="ticket-link" data-ticket="${t.id}">${escapeHTML(t.subject)}</a><div class="ticket-id">#${t.id} · ${dateLabel(t.createdAt)}</div></td><td class="customer-cell">${escapeHTML(t.customer)}</td><td>${escapeHTML(t.category)}</td><td>${priorityBadge(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${escapeHTML(t.assignee)}</td><td><button class="icon-btn row-open" data-ticket="${t.id}" aria-label="Open ticket">↗</button></td></tr>`).join(""):`<tr><td colspan="7" style="text-align:center;padding:30px">No matching tickets found.</td></tr>`;
  document.getElementById("ticketCount").textContent=`Showing ${rows.length} of ${data.tickets.length} tickets`;
}
function renderAgentSelects(){["assignee","detailAssignee"].forEach(id=>{const select=document.getElementById(id);if(select){const old=select.value||"Unassigned";select.innerHTML=getAgentOptions(old);}});}
function openTicket(id){const ticket=data.tickets.find(t=>t.id===Number(id));if(!ticket){showToast("Ticket not found.");return;}currentTicketId=ticket.id;document.getElementById("detailTitle").textContent=ticket.subject;document.getElementById("detailSubtitle").textContent=`Ticket #${ticket.id} · Created ${dateLabel(ticket.createdAt)}`;document.getElementById("detailMeta").innerHTML=`${statusBadge(ticket.status)} ${priorityBadge(ticket.priority)} <span class="status status-on-hold">${escapeHTML(ticket.category)}</span>`;document.getElementById("detailDescription").textContent=ticket.description;document.getElementById("detailId").textContent="#"+ticket.id;document.getElementById("detailCreated").textContent=dateLabel(ticket.createdAt);document.getElementById("detailEmail").textContent=ticket.email;document.getElementById("detailStatus").value=ticket.status;document.getElementById("detailPriority").value=ticket.priority;renderAgentSelects();document.getElementById("detailAssignee").value=ticket.assignee;renderMessages(ticket);navigate("detail");}
function renderMessages(ticket){const list=document.getElementById("messageList");list.innerHTML=ticket.messages.length?ticket.messages.map(m=>`<article class="message"><div class="message-top"><span>${escapeHTML(m.sender)}</span><small>${escapeHTML(m.time)}</small></div><p>${escapeHTML(m.text)}</p></article>`).join(""):`<p class="muted">No replies yet. Start the conversation below.</p>`;document.getElementById("messageCount").textContent=`${ticket.messages.length} ${ticket.messages.length===1?"reply":"replies"}`;}
function resetTicketForm(){document.getElementById("ticketForm").reset();document.getElementById("editTicketId").value="";document.getElementById("formHeading").textContent="Create a ticket";document.getElementById("saveTicketBtn").textContent="Create ticket →";document.getElementById("priority").value="Medium";document.getElementById("status").value="New";renderAgentSelects();}
function editTicket(id){const t=data.tickets.find(item=>item.id===Number(id));if(!t)return;document.getElementById("editTicketId").value=t.id;document.getElementById("subject").value=t.subject;document.getElementById("description").value=t.description;document.getElementById("customer").value=t.customer;document.getElementById("email").value=t.email;document.getElementById("category").value=t.category;document.getElementById("priority").value=t.priority;document.getElementById("status").value=t.status;renderAgentSelects();document.getElementById("assignee").value=t.assignee;document.getElementById("formHeading").textContent="Edit ticket";document.getElementById("saveTicketBtn").textContent="Save changes →";navigate("create");}
function renderKnowledge(){const grid=document.getElementById("knowledgeGrid");if(!grid)return;grid.innerHTML=data.articles.map(article=>`<article class="knowledge-card"><div class="article-icon">▧</div><h3>${escapeHTML(article.title)}</h3><p>${escapeHTML(article.content)}</p><small>${escapeHTML(article.category.toUpperCase())}</small></article>`).join("")||'<p class="muted">No articles yet.</p>';}
function renderAgents(){const grid=document.getElementById("agentsGrid");if(!grid)return;grid.innerHTML=data.agents.map(agent=>{const workload=data.tickets.filter(t=>t.assignee===agent.name&&!["Resolved","Closed"].includes(t.status)).length;return `<article class="agent-card"><div class="avatar purple">${escapeHTML(initials(agent.name))}</div><h3>${escapeHTML(agent.name)}</h3><p>${escapeHTML(agent.department)}</p><p>${escapeHTML(agent.email)}</p><div class="workload"><span>Open workload</span><strong>${workload} tickets</strong></div></article>`;}).join("")||'<p class="muted">No agents added.</p>';}
function renderReports(){const total=data.tickets.length,resolved=data.tickets.filter(t=>t.status==="Resolved").length,open=activeCount();document.getElementById("reportTotal").textContent=total;document.getElementById("reportResolved").textContent=resolved;document.getElementById("reportRate").textContent=(total?Math.round(resolved/total*100):0)+"%";document.getElementById("reportOpen").textContent=open;const statuses=["New","In Progress","On Hold","Resolved","Closed"];document.getElementById("statusReport").innerHTML=statuses.map(s=>{const n=data.tickets.filter(t=>t.status===s).length;return `<div class="status-report-row"><span>${s}</span><div class="bar-track"><div class="bar-fill" style="width:${total?n/total*100:0}%;background:#8d5ce2"></div></div><strong>${n}</strong></div>`;}).join("");}

document.addEventListener("click",event=>{
  const go=event.target.closest("[data-go]");if(go){event.preventDefault();if(go.dataset.go==="create")resetTicketForm();navigate(go.dataset.go);return;}
  const nav=event.target.closest("[data-page]");if(nav){event.preventDefault();navigate(nav.dataset.page);return;}
  const ticket=event.target.closest("[data-ticket]");if(ticket){event.preventDefault();openTicket(ticket.dataset.ticket);}
});
document.getElementById("ticketForm").addEventListener("submit",event=>{
  event.preventDefault();const id=document.getElementById("editTicketId").value;const existing=id?data.tickets.find(t=>t.id===Number(id)):null;
  const ticket={id:existing?existing.id:Math.max(1000,...data.tickets.map(t=>t.id))+1,subject:document.getElementById("subject").value.trim(),description:document.getElementById("description").value.trim(),customer:document.getElementById("customer").value.trim(),email:document.getElementById("email").value.trim(),category:document.getElementById("category").value,priority:document.getElementById("priority").value,status:document.getElementById("status").value,assignee:document.getElementById("assignee").value,createdAt:existing?existing.createdAt:new Date().toISOString(),messages:existing?existing.messages:[]};
  if(existing){Object.assign(existing,ticket);}else{data.tickets.unshift(ticket);}refresh();resetTicketForm();navigate("tickets");showToast(existing?"Ticket updated successfully.":"Ticket created successfully.");
});
["ticketSearch","statusFilter","priorityFilter","assigneeFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderTickets));
document.getElementById("globalSearch").addEventListener("input",event=>{document.getElementById("ticketSearch").value=event.target.value;navigate("tickets");renderTickets();});
document.getElementById("editDetailBtn").addEventListener("click",()=>editTicket(currentTicketId));
document.getElementById("deleteDetailBtn").addEventListener("click",()=>{if(!currentTicketId)return;if(confirm("Delete this ticket? This action cannot be undone.")){data.tickets=data.tickets.filter(t=>t.id!==currentTicketId);currentTicketId=null;refresh();navigate("tickets");showToast("Ticket deleted.");}});
["detailStatus","detailPriority","detailAssignee"].forEach(id=>document.getElementById(id).addEventListener("change",event=>{const t=data.tickets.find(item=>item.id===currentTicketId);if(!t)return;if(id==="detailStatus")t.status=event.target.value;if(id==="detailPriority")t.priority=event.target.value;if(id==="detailAssignee")t.assignee=event.target.value;document.getElementById("detailMeta").innerHTML=`${statusBadge(t.status)} ${priorityBadge(t.priority)} <span class="status status-on-hold">${escapeHTML(t.category)}</span>`;refresh();showToast("Ticket details updated.");}));
document.getElementById("replyForm").addEventListener("submit",event=>{event.preventDefault();const t=data.tickets.find(item=>item.id===currentTicketId);const text=document.getElementById("replyText").value.trim();if(!t||!text)return;t.messages.push({sender:"Manaswitha Gajji",text,time:new Date().toLocaleString()});document.getElementById("replyText").value="";renderMessages(t);saveData();showToast("Reply added.");});
document.getElementById("addArticleBtn").addEventListener("click",()=>document.getElementById("articleDialog").showModal());
document.getElementById("saveArticleBtn").addEventListener("click",event=>{event.preventDefault();const title=document.getElementById("articleTitle").value.trim(),category=document.getElementById("articleCategory").value.trim(),content=document.getElementById("articleContent").value.trim();if(!title||!category||!content){showToast("Please complete all article fields.");return;}data.articles.push({id:Date.now(),title,category,content});saveData();renderKnowledge();document.getElementById("articleDialog").close();document.getElementById("articleForm").reset();showToast("Knowledge article added.");});
document.getElementById("addAgentBtn").addEventListener("click",()=>document.getElementById("agentDialog").showModal());
document.getElementById("saveAgentBtn").addEventListener("click",event=>{event.preventDefault();const name=document.getElementById("agentName").value.trim(),email=document.getElementById("agentEmail").value.trim(),department=document.getElementById("agentDepartment").value.trim();if(!name||!email||!department){showToast("Please complete all agent fields.");return;}if(data.agents.some(a=>a.email.toLowerCase()===email.toLowerCase())){showToast("An agent with this email already exists.");return;}data.agents.push({id:Date.now(),name,email,department});refresh();document.getElementById("agentDialog").close();document.getElementById("agentForm").reset();showToast("Agent added successfully.");});
document.getElementById("exportBtn").addEventListener("click",()=>{const columns=["id","subject","customer","email","category","priority","status","assignee","createdAt"];const csv=[columns.join(","),...data.tickets.map(t=>columns.map(key=>`"${String(t[key]??"").replace(/"/g,'""')}"`).join(","))].join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="tickethub-report.csv";a.click();URL.revokeObjectURL(url);showToast("CSV report exported.");});
document.getElementById("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("tickethub_dark",document.body.classList.contains("dark")?"1":"0");});
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
document.getElementById("notificationBtn").addEventListener("click",()=>showToast("You're all caught up!"));
document.getElementById("logoutBtn").addEventListener("click",()=>showToast("Demo mode: sign-in is simulated."));
document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();document.getElementById("globalSearch").focus();}});
if(localStorage.getItem("tickethub_dark")==="1")document.body.classList.add("dark");
refresh();navigate("dashboard");
