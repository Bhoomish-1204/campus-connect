export default function EmptyState({icon:Icon,title,text}){return <div className="empty"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{text}</p></div>}
