import React,{useState} from 'react'
import {NavLink,useNavigate} from 'react-router-dom'
import {LayoutDashboard,Briefcase,BookOpen,CalendarDays,ClipboardList,UserCircle,LogOut,Menu,X,ShieldCheck} from 'lucide-react'

export default function Layout({children,profile,signOut}){
 const [open,setOpen]=useState(false); const nav=useNavigate()
 const links=[['/','Dashboard',LayoutDashboard],['/opportunities','Opportunities',Briefcase],['/resources','Resources',BookOpen],['/events','Events',CalendarDays],['/applications','Applications',ClipboardList],['/profile','Profile',UserCircle]]
 if(profile?.role==='admin') links.push(['/admin','Admin',ShieldCheck])
 return <div className="app-shell">
  <aside className={open?'sidebar open':'sidebar'}>
   <div className="sidebar-top"><div className="brand"><span className="brand-mark">CC</span><span>CampusConnect</span></div><button className="icon-btn mobile-close" onClick={()=>setOpen(false)}><X size={20}/></button></div>
   <nav>{links.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-item active':'nav-item'}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
   <div className="sidebar-bottom"><div className="mini-profile"><div className="avatar">{(profile?.full_name||'S')[0].toUpperCase()}</div><div><b>{profile?.full_name||'Student'}</b><small>{profile?.department||'Campus member'}</small></div></div><button className="logout" onClick={signOut}><LogOut size={17}/> Sign out</button></div>
  </aside>
  <main className="main"><header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setOpen(true)}><Menu/></button><div className="topbar-title">Your campus, connected.</div><button className="avatar avatar-btn" onClick={()=>nav('/profile')}>{(profile?.full_name||'S')[0].toUpperCase()}</button></header><section className="content">{children}</section></main>
 </div>
}
