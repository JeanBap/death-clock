function joinWaitlist() {
  const email = prompt('Enter your email to join the consultation waiting list:');
  if (!email || !email.includes('@')) return;
  localStorage.setItem('dc_waitlist_email', email);
  const el = document.getElementById('waitlistCount');
  if (el) el.innerHTML = '&#10003; You\'re on the list! We\'ll email you at <strong>' + escHtml(email) + '</strong> when a slot opens.';
  alert('You\'re in! Position #128 on the waiting list. We\'ll reach out when a healthspan specialist is available.');
}

function captureEmail() {
  const input = document.getElementById('emailCaptureInput');
  if (!input) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) { input.style.borderColor = 'var(--accent)'; return; }
  localStorage.setItem('dc_user_email', email);
  const prefs = {
    weekly_report: document.getElementById('emailPrefWeekly')?.checked || false,
    milestone_alerts: document.getElementById('emailPrefMilestone')?.checked || false,
    tips: document.getElementById('emailPrefTips')?.checked || false
  };
  localStorage.setItem('dc_email_prefs', JSON.stringify(prefs));
  const container = document.getElementById('emailCaptureSection');
  if (container) container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--green);"><strong>&#10003; Locked in.</strong> We\'ll haunt your inbox at ' + escHtml(email) + '</div>';
}

function generateShareText() {
  if (!state.result) return '';
  const r = state.result;
  const dd = r.deathDate;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return 'I just found out I\'m dying on ' + months[dd.getMonth()] + ' ' + dd.getDate() + ', ' + dd.getFullYear() +
    '. That\'s ' + r.remainingYears + ' years left. My Life Score: ' + r.lifeScore + '/100. ' +
    'Think you\'ll outlive me? death-clock.app';
}

function shareResult(platform) {
  const text = encodeURIComponent(generateShareText());
  const url = encodeURIComponent('https://death-clock.app');
  const links = {
    twitter: 'https://twitter.com/intent/tweet?text=' + text,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url + '&quote=' + text,
    whatsapp: 'https://wa.me/?text=' + text,
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
    copy: null
  };
  if (platform === 'copy') {
    navigator.clipboard.writeText(decodeURIComponent(text)).then(() => {
      const btn = document.querySelector('.share-btn-copy');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 2000); }
    });
    return;
  }
  if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
}

function challengeAFriend() {
  let challengeText = 'I just took the Death Clock quiz. Think you\'ll outlive me? Take it and find out: https://death-clock.app';
  if (state.result) {
    const r = state.result;
    challengeText = 'I\'m dying on ' + r.deathDate.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) +
      '. That gives me ' + r.remainingYears + ' years. Think you can beat me? Take the Death Clock quiz: https://death-clock.app';
  }
  const encoded = encodeURIComponent(challengeText);
  const url = encodeURIComponent('https://death-clock.app');

  // Show challenge modal
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (modal && content) {
    modal.classList.remove('hidden');
    content.innerHTML = `
      <h3 style="text-align:center; margin-bottom:4px;">&#9876; Challenge a Friend</h3>
      <p style="text-align:center; color:var(--text2); font-size:0.85rem; margin-bottom:16px;">Who dies first? Send this challenge.</p>
      <div style="background:var(--bg); padding:12px; border-radius:8px; margin-bottom:16px; font-size:0.85rem; color:var(--text2);">${challengeText.replace(/'/g,'&#39;')}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button onclick="window.open('https://wa.me/?text=${encoded}','_blank','width=600,height=400')" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; background:#25D366; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.9rem;">WhatsApp</button>
        <button onclick="window.open('https://twitter.com/intent/tweet?text=${encoded}','_blank','width=600,height=400')" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; background:#1DA1F2; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.9rem;">Twitter/X</button>
        <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}','_blank','width=600,height=400')" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; background:#4267B2; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.9rem;">Facebook</button>
        <button id="challengeCopyBtn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encoded}')).then(()=>{document.getElementById('challengeCopyBtn').textContent='Copied!';setTimeout(()=>document.getElementById('challengeCopyBtn').textContent='Copy Text',2000)})" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:8px; cursor:pointer; font-size:0.9rem;">Copy Text</button>
      </div>
      <button onclick="closeModal()" style="display:block; margin:16px auto 0; background:none; border:none; color:var(--text3); cursor:pointer; font-size:0.85rem;">Close</button>
    `;
  } else {
    // Fallback: native share or copy
    if (navigator.share) {
      navigator.share({ title: 'Death Clock Challenge', text: challengeText, url: 'https://death-clock.app' });
    } else {
      navigator.clipboard.writeText(challengeText);
      if (typeof showToast === 'function') showToast('Challenge copied to clipboard!');
    }
  }
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DC-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getOrCreateInviteCode() {
  let code = localStorage.getItem('dc_invite_code');
  if (!code) { code = generateInviteCode(); localStorage.setItem('dc_invite_code', code); }
  return code;
}
function getSocialCircle() {
  return JSON.parse(localStorage.getItem('dc_social_circle') || '[]');
}

function saveSocialCircle(circle) {
  localStorage.setItem('dc_social_circle', JSON.stringify(circle));
}

function addFriendToCircle(name, deathYear, lifeScore) {
  const circle = getSocialCircle();
  circle.push({ name, deathYear, lifeScore, addedAt: new Date().toISOString() });
  saveSocialCircle(circle);
}
// Referral invite modal (social circle)
function showInviteModal() {
  const code = getOrCreateInviteCode();
  const inviteUrl = 'https://death-clock.app?ref=' + code;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalContent').innerHTML = `
    <h3>Invite Friends to Death Clock</h3>
    <p style="color:var(--text2); margin-bottom:16px;">Challenge your friends. See who dies first. (Dark? Yes. Motivating? Also yes.)</p>
    <div style="background:var(--bg); padding:16px; border-radius:var(--radius); text-align:center; margin-bottom:16px;">
      <div style="font-size:0.8rem; color:var(--text3); margin-bottom:4px;">Your invite link</div>
      <div style="font-size:1rem; color:var(--gold); word-break:break-all;" id="inviteLink">${inviteUrl}</div>
      <button class="btn-primary btn-sm" onclick="navigator.clipboard.writeText('${inviteUrl}').then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy Link',2000)})" style="margin-top:8px;">Copy Link</button>
    </div>
    <p style="color:var(--text3); font-size:0.8rem;">When friends complete the quiz with your link, they'll appear in your Social Circle leaderboard.</p>
    <div style="margin-top:16px;">
      <h4 style="margin-bottom:8px;">Add a friend manually</h4>
      <div class="form-group"><label>Name</label><input type="text" id="friendName" placeholder="e.g. Dave"></div>
      <div class="form-group"><label>Their death year (from their result)</label><input type="number" id="friendDeathYear" placeholder="e.g. 2078"></div>
      <div class="form-group"><label>Their Life Score</label><input type="number" id="friendScore" placeholder="e.g. 62" min="0" max="100"></div>
      <button class="btn-green btn-sm" onclick="addFriendManual()">Add Friend</button>
    </div>
  `;
}

function addFriendManual() {
  const name = document.getElementById('friendName')?.value.trim();
  const deathYear = parseInt(document.getElementById('friendDeathYear')?.value);
  const score = parseInt(document.getElementById('friendScore')?.value);
  if (!name || !deathYear) { alert('Need at least a name and death year.'); return; }
  addFriendToCircle(name, deathYear, score || 0);
  closeModal();
  if (state.currentPage === 'result') renderResult();
  if (state.result) updateNavTimer();
  else if (state.currentPage === 'dashboard') renderDashboard();
}

function renderSocialCircle() {
  // Show choice: global leaderboard or friends circle
  const circle = getSocialCircle();
  const hasCircle = circle.length > 0;
  const showGlobal = localStorage.getItem('dc_leaderboard_pref') === 'global';

  if (!hasCircle && !showGlobal) {
    return `
    <div style="margin-top:48px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; text-align:center;">
      <h3 style="color:var(--gold); margin-bottom:8px;">&#9760; Who Dies First?</h3>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:16px;">Competition makes everything better. Even death.</p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <button class="btn-primary" onclick="localStorage.setItem('dc_leaderboard_pref','global'); document.getElementById('socialCircle').innerHTML = renderSocialCircle();" style="padding:12px 24px;">
          &#127758; Global Leaderboard<br><span style="font-size:0.75rem; opacity:0.8;">Compete with the world</span>
        </button>
        <button class="btn-gold" onclick="showInviteModal()" style="padding:12px 24px;">
          &#128101; Friends Circle<br><span style="font-size:0.75rem; opacity:0.8;">Challenge your mates</span>
        </button>
      </div>
    </div>`;
  }
  return renderSocialCircleInner();
}

function renderSocialCircleInner() {
  const circle = getSocialCircle();
  if (!state.result) return '';
  const myYear = state.result.deathDate.getFullYear();
  const myName = 'You';
  const all = [{ name: myName, deathYear: myYear, lifeScore: state.result.lifeScore, isMe: true }, ...circle];
  all.sort((a, b) => b.deathYear - a.deathYear);

  if (circle.length === 0) {
    return `
      <div class="social-circle" style="margin-top:32px;">
        <h3>Social Circle Leaderboard</h3>
        <p style="color:var(--text2);">Who in your friend group dies first? Invite friends to find out.</p>
        <button class="btn-gold btn-sm" onclick="showInviteModal()" style="margin-top:8px;">Invite Friends</button>
      </div>`;
  }

  return `
    <div class="social-circle" style="margin-top:32px;">
      <h3>Social Circle: Who Dies First?</h3>
      <div style="margin:16px 0;">
        ${all.map((p, i) => {
          const medal = i === 0 ? '&#x1F451;' : i === all.length - 1 ? '&#x1F480;' : '';
          const rowStyle = p.isMe ? 'border-color:var(--gold); background:rgba(240,192,64,0.05);' : '';
          return `<div class="social-row" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border:1px solid var(--border); border-radius:8px; margin-bottom:6px; ${rowStyle}">
            <div style="font-size:1.2rem; min-width:30px; text-align:center;">${medal || '#' + (i + 1)}</div>
            <div style="flex:1;"><strong>${p.name}</strong>${p.isMe ? ' (you)' : ''}</div>
            <div style="color:var(--text2); font-size:0.9rem;">Dies ~${p.deathYear}</div>
            <div style="color:var(--gold); font-size:0.85rem;">Score: ${p.lifeScore}</div>
          </div>`;
        }).join('')}
      </div>
      <button class="btn-gold btn-sm" onclick="showInviteModal()">Invite More Friends</button>
    </div>`;
}
async function getSocialSession() {
  if (!socialClient) return null;
  try {
    const { data } = await socialClient.auth.getSession();
    return data?.session?.user || null;
  } catch(e) { return null; }
}

async function loadSocialProfile() {
  const user = await getSocialSession();
  if (!user) return;
  state.socialUser = user;
  try {
    const { data } = await socialClient.from('dc_profiles').select('*').eq('id', user.id).single();
    if (data) {
      state.socialProfile = data;
      const nameInput = document.getElementById('socialUsername');
      if (nameInput) nameInput.value = data.display_name || data.username || '';
      document.getElementById('navMansion')?.classList.remove('hidden');
    }
  } catch(e) { console.warn('Load social profile:', e); }
}

async function saveSocialProfile() {
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }
  const name = document.getElementById('socialUsername')?.value.trim();
  if (!name || name.length < 2) { showToast('Name must be at least 2 characters'); return; }

  const username = name.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
  const profileData = {
    id: user.id,
    username: username,
    display_name: name,
    life_expectancy: state.result ? parseFloat(state.result.adjustedLE) : null,
    health_score: state.result ? state.result.lifeScore : null,
    country: state.answers?.country || null,
    sport: state.answers?.sport || null,
    ghost_color: getGhostColor(),
    ghost_eye_style: getGhostEyeStyle(),
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await socialClient.from('dc_profiles').upsert(profileData);
    if (error) throw error;
    state.socialProfile = profileData;
    document.getElementById('socialProfileStatus').textContent = 'Profile saved! You can now join haunting groups.';
    document.getElementById('socialProfileStatus').style.color = 'var(--green)';
    document.getElementById('navMansion')?.classList.remove('hidden');
    showToast('Ghost identity saved!');
  } catch(e) {
    if (e.message?.includes('duplicate')) {
      // Username taken, add random suffix
      profileData.username = username + '_' + Math.floor(Math.random()*999);
      const { error: e2 } = await socialClient.from('dc_profiles').upsert(profileData);
      if (!e2) {
        state.socialProfile = profileData;
        showToast('Saved (username adjusted)!');
      } else { showToast('Error: ' + e2.message); }
    } else { showToast('Error: ' + e.message); }
  }
}

function getGhostColor() {
  if (!state.result) return '#00ff88';
  const score = state.result.lifeScore || 50;
  if (score >= 80) return '#00ff88';
  if (score >= 60) return '#4de6a8';
  if (score >= 40) return '#f0c040';
  if (score >= 20) return '#e94560';
  return '#8b0000';
}

function getGhostEyeStyle() {
  if (!state.result) return 'normal';
  const score = state.result.lifeScore || 50;
  if (score >= 80) return 'happy';
  if (score >= 60) return 'normal';
  if (score >= 40) return 'worried';
  return 'dead';
}

async function createHauntingGroup() {
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }
  if (!state.socialProfile) { showToast('Save your social profile first!'); return; }

  const name = document.getElementById('newGroupName')?.value.trim();
  if (!name) { showToast('Enter a group name'); return; }
  const desc = document.getElementById('newGroupDesc')?.value.trim();
  const code = generateInviteCode();

  try {
    const { data, error } = await socialClient.from('dc_haunting_groups').insert({
      name, description: desc || null, invite_code: code, owner_id: user.id
    }).select().single();
    if (error) throw error;

    // Add owner as member
    await socialClient.from('dc_group_members').insert({
      group_id: data.id, user_id: user.id, role: 'owner'
    });

    hideModal('createGroupModal');
    state.currentGroup = data;
    showToast('Group created! Share code: ' + code);
    showPage('mansion');
  } catch(e) { showToast('Error: ' + e.message); }
}

function showCreateGroupModal() {
  showModal('createGroupModal');
}

function showGroupInviteModal() {
  if (!state.currentGroup) { showToast('Select a group first'); return; }
  showModal('inviteModal');
  const modal = document.getElementById('inviteModal');
  document.getElementById('inviteCodeDisplay').textContent = state.currentGroup.invite_code;
  document.getElementById('inviteLinkDisplay').textContent = 'https://death-clock.app?join=' + state.currentGroup.invite_code;
}

function hideModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
  // Restore focus to trigger element
  if (window._modalTrigger) { window._modalTrigger.focus(); window._modalTrigger = null; }
}
function showModal(id) {
  window._modalTrigger = document.activeElement;
  const el = document.getElementById(id);
  if (el) { el.classList.remove('hidden'); el.style.display = 'flex'; }
  // Focus first input or button inside
  setTimeout(() => {
    const focusable = el?.querySelector('input, button, [tabindex]');
    if (focusable) focusable.focus();
  }, 100);
}

function copyInviteCode() {
  const code = state.currentGroup?.invite_code;
  if (code) {
    navigator.clipboard?.writeText(code);
    showToast('Code copied: ' + code);
  }
}

function copyInviteLink() {
  const code = state.currentGroup?.invite_code;
  if (code) {
    const link = 'https://death-clock.app?join=' + code;
    navigator.clipboard?.writeText(link);
    showToast('Invite link copied!');
  }
}

async function joinGroupByCode() {
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }
  if (!state.socialProfile) { showToast('Save your social profile first!'); return; }

  let input = document.getElementById('joinCodeInput')?.value.trim();
  if (!input) { showToast('Enter a code or link'); return; }

  // Extract code from link if needed
  if (input.includes('join=')) input = input.split('join=')[1].split('&')[0];
  input = input.toUpperCase();

  try {
    // Find group by code
    const { data: group, error } = await socialClient.from('dc_haunting_groups')
      .select('*').eq('invite_code', input).single();
    if (error || !group) { showToast('Invalid code. Check and try again.'); return; }

    // Check if already member
    const { data: existing } = await socialClient.from('dc_group_members')
      .select('id').eq('group_id', group.id).eq('user_id', user.id).single();
    if (existing) {
      state.currentGroup = group;
      showToast('You are already in this group!');
      showPage('mansion');
      return;
    }

    // Check member count
    const { count } = await socialClient.from('dc_group_members')
      .select('*', { count: 'exact', head: true }).eq('group_id', group.id);
    if (count >= group.max_members) { showToast('Group is full!'); return; }

    // Join
    const { error: joinErr } = await socialClient.from('dc_group_members').insert({
      group_id: group.id, user_id: user.id, role: 'ghost'
    });
    if (joinErr) throw joinErr;

    state.currentGroup = group;
    showToast('Welcome to ' + group.name + '!');
    showPage('mansion');
  } catch(e) { showToast('Error joining: ' + e.message); }
}

async function sendEmailInvite() {
  if (!state.currentGroup) return;
  const email = document.getElementById('inviteEmailInput')?.value.trim();
  if (!email || !email.includes('@')) { showToast('Enter a valid email'); return; }
  const user = await getSocialSession();
  if (!user) return;

  try {
    await socialClient.from('dc_invites').insert({
      group_id: state.currentGroup.id,
      invited_by: user.id,
      email: email
    });
    showToast('Invite sent to ' + email + '! (Share the code too: ' + state.currentGroup.invite_code + ')');
    document.getElementById('inviteEmailInput').value = '';
  } catch(e) { showToast('Error: ' + e.message); }
}

async function renderGroupsList() {
  const user = await getSocialSession();
  if (!user) {
    document.getElementById('groupsList').innerHTML = '<div class="social-auth-section"><p style="text-align:center; color:var(--text2);">Sign in on your Profile page to create or join haunting groups.</p><button class="btn-primary" onclick="showPage(&quot;profile&quot;)" style="margin-top:12px; display:block; margin-left:auto; margin-right:auto;">Go to Profile</button></div>';
    return;
  }

  try {
    // Get user's groups
    const { data: memberships } = await socialClient.from('dc_group_members')
      .select('group_id, role').eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      document.getElementById('groupsList').innerHTML = '<div style="text-align:center; padding:40px; color:var(--text2);"><p style="font-size:1.1rem; margin-bottom:8px;">No haunting groups yet</p><p style="font-size:0.85rem;">Create one or join with a code!</p></div>';
      return;
    }

    const groupIds = memberships.map(m => m.group_id);
    const { data: groups } = await socialClient.from('dc_haunting_groups')
      .select('*').in('id', groupIds);

    // Get member counts (batch query instead of N+1)
    const { data: allMembers } = await socialClient.from('dc_group_members')
      .select('group_id').in('group_id', groupIds);
    const memberCounts = {};
    (allMembers || []).forEach(m => { memberCounts[m.group_id] = (memberCounts[m.group_id] || 0) + 1; });

    let html = '';
    for (const g of (groups || [])) {
      const count = memberCounts[g.id] || 0;
      const role = memberships.find(m => m.group_id === g.id)?.role || 'ghost';
      html += '<div class="group-card" onclick="enterMansion(&quot;'+g.id+'&quot;)"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h3 style="margin-bottom:4px;">'+escHtml(g.name)+'</h3><p class="group-member-count">'+count+' ghost'+(count!==1?'s':'')+' haunting</p></div><div style="text-align:right;"><span style="font-size:0.75rem; color:var(--text3);">'+role+'</span><br><span style="font-size:0.75rem; color:var(--gold);">'+g.invite_code+'</span></div></div>'+(g.description?'<p style="color:var(--text2); font-size:0.85rem; margin-top:8px;">'+escHtml(g.description)+'</p>':'')+'</div>';
    }
    document.getElementById('groupsList').innerHTML = html;
    state.groups = groups || [];
  } catch(e) {
    document.getElementById('groupsList').innerHTML = '<p style="color:var(--accent);">Error loading groups: '+escHtml(e.message)+'</p>';
  }
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

async function enterMansion(groupId) {
  const { data: group } = await socialClient.from('dc_haunting_groups')
    .select('*').eq('id', groupId).single();
  if (group) {
    state.currentGroup = group;
    showPage('mansion');
  }
}

function buildMansionGhostSVG(color, eyeStyle, size) {
  size = size || 60;
  const eyeMap = {
    happy: '<ellipse cx="38" cy="42" rx="6" ry="3" fill="#1a1a2e"/><ellipse cx="62" cy="42" rx="6" ry="3" fill="#1a1a2e"/>',
    normal: '<ellipse cx="38" cy="42" rx="7" ry="8" fill="#1a1a2e"/><ellipse cx="40" cy="40" rx="2.5" ry="3" fill="#fff"/><ellipse cx="62" cy="42" rx="7" ry="8" fill="#1a1a2e"/><ellipse cx="64" cy="40" rx="2.5" ry="3" fill="#fff"/>',
    worried: '<ellipse cx="38" cy="44" rx="8" ry="10" fill="#1a1a2e"/><ellipse cx="40" cy="42" rx="3" ry="3.5" fill="#fff"/><ellipse cx="62" cy="44" rx="8" ry="10" fill="#1a1a2e"/><ellipse cx="64" cy="42" rx="3" ry="3.5" fill="#fff"/>',
    dead: '<line x1="32" y1="38" x2="44" y2="48" stroke="#1a1a2e" stroke-width="3"/><line x1="44" y1="38" x2="32" y2="48" stroke="#1a1a2e" stroke-width="3"/><line x1="56" y1="38" x2="68" y2="48" stroke="#1a1a2e" stroke-width="3"/><line x1="68" y1="38" x2="56" y2="48" stroke="#1a1a2e" stroke-width="3"/>'
  };
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="'+size+'" height="'+(size*1.2)+'"><defs><radialGradient id="mg'+color.replace('#','')+'"><stop offset="0%" stop-color="'+color+'" stop-opacity="0.9"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0.5"/></radialGradient></defs><path d="M50 5C25 5 10 30 10 55c0 20 0 45 0 60q8-10 13 0 6 10 12 0 6-10 15 0 9-10 15 0 6 10 12 0 6-10 13 0c0-15 0-40 0-60C90 30 75 5 50 5z" fill="url(#mg'+color.replace('#','')+')" opacity="0.85"/>'+(eyeMap[eyeStyle]||eyeMap.normal)+'</svg>';
}

function buildChandelierSVG() {
  return '<svg width="120" height="100" viewBox="0 0 120 100"><line x1="60" y1="0" x2="60" y2="25" stroke="#8b7355" stroke-width="2"/><path d="M20 40Q60 25 100 40" fill="none" stroke="#8b7355" stroke-width="2"/><line x1="20" y1="40" x2="20" y2="55" stroke="#666" stroke-width="1"/><line x1="45" y1="33" x2="45" y2="48" stroke="#666" stroke-width="1"/><line x1="60" y1="30" x2="60" y2="45" stroke="#666" stroke-width="1"/><line x1="75" y1="33" x2="75" y2="48" stroke="#666" stroke-width="1"/><line x1="100" y1="40" x2="100" y2="55" stroke="#666" stroke-width="1"/><circle cx="20" cy="58" r="4" fill="#f0c040" opacity="0.8"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="45" cy="51" r="4" fill="#f0c040" opacity="0.8"><animate attributeName="opacity" values="0.8;0.5;0.8" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="60" cy="48" r="5" fill="#f0c040" opacity="0.9"><animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="75" cy="51" r="4" fill="#f0c040" opacity="0.8"><animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/></circle><circle cx="100" cy="58" r="4" fill="#f0c040" opacity="0.8"><animate attributeName="opacity" values="0.9;0.6;0.9" dur="1.6s" repeatCount="indefinite"/></circle></svg>';
}

function buildCobwebSVG(size) {
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 80 80" opacity="0.3"><path d="M0 0Q40 10 80 0M0 0Q10 40 0 80M0 0Q25 25 50 50M0 0Q35 15 70 30M0 0Q15 35 30 70" fill="none" stroke="#888" stroke-width="0.5"/><path d="M10 3Q20 10 15 20M25 6Q30 18 22 30M5 10Q15 15 10 25" fill="none" stroke="#888" stroke-width="0.3"/></svg>';
}

async function renderMansion() {
  const user = await getSocialSession();
  if (!user || !state.currentGroup) {
    // No group selected - try to load first group or show prompt
    if (user) {
      const { data: memberships } = await socialClient.from('dc_group_members')
        .select('group_id').eq('user_id', user.id).limit(1);
      if (memberships && memberships.length > 0) {
        const { data: group } = await socialClient.from('dc_haunting_groups')
          .select('*').eq('id', memberships[0].group_id).single();
        if (group) { state.currentGroup = group; renderMansion(); return; }
      }
    }
    const mHall = document.getElementById('mansionHall');
    if (mHall) mHall.innerHTML = '<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:10;"><div style="text-align:center; padding:40px;"><p style="font-size:1.2rem; margin-bottom:16px;">No haunting group yet</p><p style="color:var(--text2); margin-bottom:20px;">Create or join a group to see ghosts in the mansion!</p><button class="btn-primary" onclick="showPage(&quot;groups&quot;)">My Groups</button></div></div>';
    return;
  }

  const group = state.currentGroup;
  const mansionGroupNameEl = document.getElementById('mansionGroupName');
  if (mansionGroupNameEl) mansionGroupNameEl.textContent = group.name;

  try {
    // Fetch all members with profiles
    const { data: members, error: membersErr } = await socialClient.from('dc_group_members')
      .select('user_id, role, joined_at').eq('group_id', group.id);

    if (membersErr) throw new Error(membersErr.message);

    if (!members || members.length === 0) {
      const mc = document.getElementById('mansionMemberCount');
      if (mc) mc.textContent = 'Empty mansion... invite some ghosts!';
      return;
    }

    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await socialClient.from('dc_profiles')
      .select('*').in('id', userIds);

    const memberCountEl = document.getElementById('mansionMemberCount');
    if (memberCountEl) memberCountEl.textContent =
      members.length + ' ghost' + (members.length !== 1 ? 's' : '') + ' haunt these halls';

    // Render chandelier
    const chandelierEl = document.getElementById('mansionChandelier');
    if (chandelierEl) chandelierEl.innerHTML = buildChandelierSVG();

    // Render decor (cobwebs, windows, candles)
    const hall = document.getElementById('mansionHall');
    if (!hall) return;
    const hallW = hall.offsetWidth || 800;
    const hallH = hall.offsetHeight || 500;

    let decorHtml = '';
    // Cobwebs in corners
    decorHtml += '<div class="mansion-cobweb" style="top:0; left:0;">'+buildCobwebSVG(80)+'</div>';
    decorHtml += '<div class="mansion-cobweb" style="top:0; right:0; transform:scaleX(-1);">'+buildCobwebSVG(80)+'</div>';
    // Windows
    decorHtml += '<div class="mansion-window" style="top:40px; left:10%; width:80px; height:100px;"></div>';
    decorHtml += '<div class="mansion-window" style="top:40px; right:10%; width:80px; height:100px;"></div>';
    // Candles on floor edges
    for (let i = 0; i < 4; i++) {
      const x = 10 + (i * 25);
      decorHtml += '<div class="mansion-candle" style="bottom:50px; left:'+x+'%;"><svg width="12" height="24"><rect x="3" y="10" width="6" height="14" fill="#8b7355" rx="1"/><ellipse cx="6" cy="10" rx="4" ry="6" fill="#f0c040" opacity="0.9"><animate attributeName="ry" values="5;7;5" dur="'+(0.8+i*0.3)+'s" repeatCount="indefinite"/></ellipse></svg></div>';
    }
    const decorEl = document.getElementById('mansionDecor');
    if (decorEl) decorEl.innerHTML = decorHtml;

    // Render ghosts floating around
    const ghostArea = { x: 60, y: 100, w: hallW - 120, h: hallH - 200 };
    let ghostsHtml = '';
    const positions = distributeGhosts(profiles?.length || 0, ghostArea);

    (profiles || []).forEach((p, i) => {
      const pos = positions[i] || { x: 100 + i * 80, y: 150 + (i % 3) * 60 };
      const color = p.ghost_color || '#00ff88';
      const eyes = p.ghost_eye_style || 'normal';
      const name = p.display_name || p.username || 'Ghost';
      const le = p.life_expectancy ? p.life_expectancy.toFixed(1) : '??';
      const animDelay = (i * 0.5) % 3;
      const isMe = p.id === user.id;
      const safeName = escHtml(name).replace(/'/g, '&#39;');
      const glow = isMe ? ' filter:drop-shadow(0 0 8px '+color+');' : '';
      const clickFn = 'showGhostInfo(&quot;'+safeName+'&quot;, '+le+', &quot;'+color+'&quot;, &quot;'+eyes+'&quot;, '+(isMe?'true':'false')+', &quot;'+p.id+'&quot;, event)';

      ghostsHtml += '<div class="mansion-ghost" style="left:'+pos.x+'px; top:'+pos.y+'px; animation-delay:'+animDelay+'s;'+glow+'" onclick="'+clickFn+'">'
        + buildMansionGhostSVG(color, eyes, 55)
        + '<div class="ghost-label">'+(isMe ? '<span style="color:var(--gold);">'+escHtml(name)+' (You)</span>' : escHtml(name))+'<span class="ghost-le">'+le+' years</span></div></div>';
    });

    const ghostsEl = document.getElementById('mansionGhosts');
    if (ghostsEl) ghostsEl.innerHTML = ghostsHtml;

  } catch(e) {
    console.error('Mansion render error:', e);
    showToast('Error loading mansion: ' + e.message);
  }
}

function distributeGhosts(count, area) {
  const positions = [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = area.w / cols;
  const cellH = area.h / rows;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: area.x + col * cellW + cellW * 0.2 + Math.random() * cellW * 0.4,
      y: area.y + row * cellH + cellH * 0.2 + Math.random() * cellH * 0.3
    });
  }
  return positions;
}

function showGhostInfo(name, le, color, eyes, isMe, targetId, event) {
  const info = document.getElementById('mansionGhostInfo');
  if (!info) return;
  info.style.display = 'block';
  const yearsLeft = (le - (state.result?.ageNow || 30)).toFixed(1);
  info.innerHTML = '<div style="display:flex; align-items:center; gap:16px;">'
    + '<div>' + buildMansionGhostSVG(color, eyes, 70) + '</div>'
    + '<div style="flex:1;"><h3>' + name + (isMe ? ' <span style="color:var(--gold);">(You)</span>' : '') + '</h3>'
    + '<p style="color:var(--text2);">Life expectancy: <strong style="color:var(--accent2);">' + le + ' years</strong></p>'
    + '<p style="color:var(--text3); font-size:0.85rem;">~' + yearsLeft + ' years of haunting left</p>'
    + (isMe ? '' : '<div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">'
      + '<button class="btn-primary btn-sm" onclick="showGhostActionMenu(\'' + targetId + '\', \'' + name + '\', \'' + color + '\', \'' + eyes + '\', ' + le + ', event.clientX, event.clientY)">👻 Haunt</button>'
      + '<button class="btn-secondary btn-sm" onclick="startGhostBattle(\'' + targetId + '\', \'' + name + '\')">⚔️ Battle</button>'
      + '</div>')
    + '</div></div>';

  // If not you, also show action menu on right-click area
  if (!isMe && event && typeof showGhostActionMenu === 'function') {
    showGhostActionMenu(targetId, name, color, eyes, le, event.clientX || 300, event.clientY || 300);
  }
}

function checkJoinCodeInURL() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join');
  if (joinCode) {
    // Store for after login
    localStorage.setItem('dc_pending_join', joinCode);
    showToast('Join code detected! Sign in to join the haunting group.');
    showPage('profile');
  }
}

// Process pending join after login
async function processPendingJoin() {
  const code = localStorage.getItem('dc_pending_join');
  if (!code) return;
  localStorage.removeItem('dc_pending_join');

  const user = await getSocialSession();
  if (!user || !state.socialProfile) return;

  document.getElementById('joinCodeInput').value = code;
  await joinGroupByCode();
}
// Init social on page load
(function initSocial() {
  setTimeout(async () => {
    if (socialClient) {
      await loadSocialProfile();
      checkJoinCodeInURL();
      // Process pending join if we just logged in
      if (state.socialUser) processPendingJoin();
    }
  }, 1500);
})();
function renderProfilePage() {
  const loggedIn = !!state.supaUser;
  document.getElementById('authLoggedOut')?.classList.toggle('hidden', loggedIn);
  document.getElementById('authLoggedIn')?.classList.toggle('hidden', !loggedIn);
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) profileBtn.textContent = loggedIn ? 'Profile' : 'Sign In';
  if (loggedIn) document.getElementById('navMansion')?.classList.remove('hidden');
  
  if (loggedIn) {
    const name = generateDeathyName ? generateDeathyName() : 'Ghost';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = state.supaUser.email || '';
    document.getElementById('profileTier').textContent = state.userTier.toUpperCase().replace('_',' ');
    document.getElementById('profileTier').style.background = state.userTier === 'free' ? 'var(--surface)' : 'var(--gold)';
    document.getElementById('profileTier').style.color = state.userTier === 'free' ? 'var(--text2)' : '#000';
    
    if (state.result) {
      document.getElementById('profileYearsLeft').textContent = state.result.remainingYears;
      document.getElementById('profileScore').textContent = state.result.lifeScore;
    }
    const g = state.longevityGoal;
    if (g) {
      document.getElementById('profileDaysAdded').textContent = (g.totalDaysAdded || 0).toFixed(1);
      document.getElementById('profileStreak').textContent = g.currentStreak || 0;
    }
    document.getElementById('profileSyncStatus').textContent = 
      state.userTier !== 'free' ? 'Data synced to cloud' : 'Data saved locally (upgrade to sync)';
    
    // Render deathy in profile
    const deathyEl = document.getElementById('profileDeathy');
    if (deathyEl && typeof renderDeathyCompanion === 'function') {
      deathyEl.innerHTML = generateDeathy(getDeathyParams());
    }
  }
  
  // Data summary
  const summaryEl = document.getElementById('profileDataSummary');
  if (summaryEl && state.result) {
    const a = state.answers;
    summaryEl.innerHTML = `
      <h3 style="margin-bottom:12px;">Your Saved Data</h3>
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.85rem;">
          ${a.sex ? `<div><span style="color:var(--text3);">Sex:</span> ${a.sex}</div>` : ''}
          ${a.country ? `<div><span style="color:var(--text3);">Country:</span> ${a.country}</div>` : ''}
          ${a.exercise ? `<div><span style="color:var(--text3);">Exercise:</span> ${a.exercise}</div>` : ''}
          ${a.diet ? `<div><span style="color:var(--text3);">Diet:</span> ${a.diet}</div>` : ''}
          ${a.smoking ? `<div><span style="color:var(--text3);">Smoking:</span> ${a.smoking}</div>` : ''}
          ${a.alcohol ? `<div><span style="color:var(--text3);">Alcohol:</span> ${a.alcohol}</div>` : ''}
          ${a.sleep_hours ? `<div><span style="color:var(--text3);">Sleep:</span> ${a.sleep_hours}</div>` : ''}
          ${a.social ? `<div><span style="color:var(--text3);">Social:</span> ${a.social}</div>` : ''}
          ${a.stress ? `<div><span style="color:var(--text3);">Stress:</span> ${a.stress}</div>` : ''}
          ${a.sport ? `<div><span style="color:var(--text3);">Sport:</span> ${a.sport}</div>` : ''}
        </div>
        <div style="margin-top:12px; font-size:0.8rem; color:var(--text3);">
          Last calculated: ${state.result.deathDate ? new Date().toLocaleDateString() : 'Never'}<br>
          Death date: ${state.result.deathDate ? state.result.deathDate.toLocaleDateString() : '-'}
        </div>
      </div>`;
  }
}


function exportProfileData() {
  const data = {
    answers: state.answers,
    result: state.result ? { ...state.result, deathDate: state.result.deathDate?.toISOString(), dob: state.result.dob?.toISOString() } : null,
    longevityGoal: state.longevityGoal,
    tier: state.userTier,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'death-clock-profile.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Profile exported!');
}

