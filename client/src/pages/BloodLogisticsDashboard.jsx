import React from 'react';
import { 
  Activity, Droplets, Truck, MessageSquare, AlertCircle, MapPin, 
  Calendar, Clock, ArrowRight, User, Bell, ChevronDown, LogOut, 
  LayoutDashboard, FileText, Settings, ChevronLeft, CheckCircle2,
  MoreHorizontal
} from 'lucide-react';

const BloodLogisticsDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0eaf5] to-[#f0f4f8] flex items-center justify-center p-4 sm:p-8 font-sans text-slate-800">
      
      {/* Main App Container */}
      <div className="w-full max-w-[1440px] h-[90vh] min-h-[800px] bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden border border-white/60">
        
        {/* =========================================
            LEFT SIDEBAR (from doclink image)
            ========================================= */}
        <div className="w-[280px] bg-white flex flex-col flex-shrink-0 z-10 border-r border-slate-100">
          {/* Logo */}
          <div className="pt-8 pb-6 px-8 flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Droplets className="h-8 w-8 text-indigo-600 relative z-10" />
              <div className="absolute inset-0 bg-indigo-100 rounded-full blur-md opacity-60"></div>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">RaktSetu</span>
          </div>

          {/* User Profile Area */}
          <div className="flex flex-col items-center pt-4 pb-8 px-8">
            <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden mb-4">
              <img src="https://i.pravatar.cc/150?img=11" alt="User Profile" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Christopher T.</h3>
            <p className="text-slate-500 text-sm">29 y.o. Coordinator</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 px-4 mt-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 text-blue-600 rounded-2xl font-medium relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
              <Activity className="h-5 w-5" />
              Blood Logistics
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-2xl font-medium transition-colors">
              <LayoutDashboard className="h-5 w-5 text-slate-400" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-2xl font-medium transition-colors">
              <User className="h-5 w-5 text-slate-400" />
              Donor Cards
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-2xl font-medium transition-colors">
              <FileText className="h-5 w-5 text-slate-400" />
              Invoice
            </a>
          </nav>

          <div className="mt-auto p-4 mb-4">
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-2xl font-medium transition-colors">
              <LogOut className="h-5 w-5" />
              Sign Out
            </a>
          </div>
        </div>

        {/* =========================================
            MAIN CONTENT AREA
            ========================================= */}
        <div className="flex-1 bg-[#F4F7FB] flex flex-col overflow-hidden relative">
          
          {/* Top Header Navigation */}
          <header className="h-20 px-10 flex items-center justify-between border-b border-slate-200/50 bg-[#F4F7FB]/80 backdrop-blur-sm z-20">
            <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">Help now</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Testimonials</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Distribution Centers</a>
              <a href="#" className="hover:text-slate-900 transition-colors">How it works</a>
              <a href="#" className="hover:text-slate-900 transition-colors">FAQ</a>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F4F7FB]">
                  1
                </span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer text-sm font-medium text-slate-700">
                USD <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer">
                 <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" />
              </div>
              <button className="bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 font-medium px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-sm transition-all">
                Request Stock <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Scrollable Workspace */}
          <div className="flex-1 overflow-y-auto p-10">
            
            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-3 mb-6">
               <button className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm hover:shadow transition-shadow">
                 <ChevronLeft className="h-5 w-5 -ml-0.5" />
               </button>
               <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Metro General Hub</h2>
            </div>

            {/* 2-Column Content Layout inside Workspace */}
            <div className="flex flex-col xl:flex-row gap-8">
              
              {/* === CENTRAL WORKSPACE (Left Side of Main) === */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* 1. Heatmap / Capacity Card (Replacing Doctor Profile) */}
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-5">
                       <div className="h-20 w-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                         <Activity className="h-10 w-10 text-indigo-500" />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-slate-900 mb-1">Live Inventory Heatmap</h3>
                         <p className="text-slate-500 text-sm mb-2">Metro General Distribution Center</p>
                         <div className="flex items-center gap-1 text-sm font-medium">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                           <span className="text-emerald-600">System verified • Live</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-8 border-b border-slate-200 mb-6">
                    <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium px-1">Overview</button>
                    <button className="pb-3 text-slate-400 font-medium hover:text-slate-600 px-1 transition-colors">Analytics</button>
                  </div>

                  {/* Details / Inventory Stats */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8 text-sm">
                    <div>
                      <span className="text-slate-400 block mb-1">Total Capacity:</span>
                      <span className="text-slate-900 font-medium">1,200 Units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Current Stock:</span>
                      <span className="text-slate-900 font-medium">843 Units (70%)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-1">Status Description:</span>
                      <p className="text-slate-700 leading-relaxed">
                        The Metro General Hub is currently operating at stable capacity overall. However, there are critical shortages in specific rare blood types (O-Negative). AI-assisted redistribution from Central Hub is recommended to mitigate risks before weekend demand surges.
                      </p>
                    </div>
                  </div>

                  {/* Visual Heatmap Bars */}
                  <div>
                     <h4 className="font-bold text-slate-900 mb-4">Current Stock Levels</h4>
                     
                     <div className="space-y-5">
                       {/* O-Negative */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-[#BE123C] font-bold text-xs">O-</div>
                             <span className="font-semibold text-slate-800 text-sm">O-Negative</span>
                           </div>
                           <span className="text-xs font-bold text-[#BE123C]">Critical (12 Units)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                           <div className="bg-[#BE123C] h-full rounded-full w-[15%]"></div>
                         </div>
                       </div>

                       {/* A-Positive */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">A+</div>
                             <span className="font-semibold text-slate-800 text-sm">A-Positive</span>
                           </div>
                           <span className="text-xs font-bold text-emerald-600">Stable (240 Units)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                           <div className="bg-emerald-500 h-full rounded-full w-[85%]"></div>
                         </div>
                       </div>

                       {/* B-Positive */}
                       <div>
                         <div className="flex justify-between items-end mb-2">
                           <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">B+</div>
                             <span className="font-semibold text-slate-800 text-sm">B-Positive</span>
                           </div>
                           <span className="text-xs font-bold text-blue-600">Stable (180 Units)</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                           <div className="bg-blue-500 h-full rounded-full w-[65%]"></div>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>

                {/* 2. Collaboration Hub (Chat thread from logistics image) */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" /> Team Coordination
                  </h3>
                  
                  <div className="flex-1 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 bg-white text-xs text-slate-400 font-medium rounded-full border border-slate-200">
                          Conversation started on 4/24/26
                        </span>
                      </div>
                    </div>

                    {/* Message 1 */}
                    <div className="flex gap-4">
                      <div className="relative">
                        <img src="https://i.pravatar.cc/150?img=33" alt="Robert" className="h-10 w-10 rounded-full object-cover shadow-sm" />
                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 text-sm">Robert Dorwart</span>
                          <span className="text-xs text-slate-400">10:42 AM</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100 inline-block">
                          <span className="text-blue-600 font-medium">@John Doe</span> <span className="text-blue-600 font-medium">@Steve Smith</span>, Any progress on the <strong className="font-semibold text-slate-900">Blood Type shortage</strong> O-Negative at Metro General Hub?
                        </p>
                        
                        {/* Embedded Task Card in chat */}
                        <div className="mt-3 max-w-sm bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignees</span>
                            <div className="flex gap-1.5">
                              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
                                <div className="h-4 w-4 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-[9px]">JD</div>
                                John Doe
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
                                <div className="h-4 w-4 bg-sky-200 text-sky-800 rounded-full flex items-center justify-center text-[9px]">ST</div>
                                Steve Smith
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                              <div className="h-2 w-2 rounded-full bg-amber-500"></div> In Review
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortage</span>
                            <span className="px-2 py-1 rounded-md text-xs font-bold bg-[#BE123C] text-white">
                              In 3 days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message 2 */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shadow-sm">
                        JD
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 text-sm">John Doe</span>
                          <span className="text-xs text-slate-400">11:15 AM</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-blue-50 p-3 rounded-2xl rounded-tl-none border border-blue-100 inline-block">
                          Steve and I are in discussion with the Central Hub. We expect to route 15 units of inventory over by Thursday.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 relative">
                    <input 
                      type="text" 
                      placeholder="Start typing..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                      <svg className="h-4 w-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </div>
                </div>
              </div>


              {/* === RIGHT ACTION PANEL === */}
              <div className="w-full xl:w-[380px] flex flex-col gap-6">
                
                {/* Logistics Intelligence Card (from logistics image) */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Blood Type Shortage</h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors">
                       <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div> In Review <ChevronDown className="h-3 w-3" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-[#BE123C] text-white shadow-sm mb-4">
                      In 3 days
                    </span>
                    <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                      <span className="text-slate-400">Location</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> Metro General Hub
                      </span>
                      <span className="text-slate-400">Product</span>
                      <span className="font-semibold text-slate-800">O-Negative Whole Blood</span>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-3 mb-4 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-[#BE123C] flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-rose-900 leading-snug">Available stock will run out in 3 days</p>
                  </div>
                  
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-md mb-6">
                    Open Current Inventory
                  </button>

                  <h4 className="text-sm font-bold text-indigo-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Activity className="h-4 w-4" /> AI Suggestion
                  </h4>

                  {/* AI Suggestion Card */}
                  <div className="border-2 border-blue-400 rounded-2xl p-4 bg-gradient-to-b from-blue-50/50 to-white relative shadow-sm">
                    <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                       <MoreHorizontal className="h-5 w-5" />
                    </div>
                    
                    <div className="flex items-start gap-3 mb-4">
                      <div className="mt-0.5 h-5 w-5 rounded bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">Move 15 units from Central</h5>
                        <p className="text-xs text-slate-500 font-medium">Arrives in 1-2 days</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">Central</span>
                      <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2 relative">
                        <Truck className="h-4 w-4 absolute -top-2 left-1/2 -translate-x-1/2 text-slate-400 bg-white px-0.5" />
                      </div>
                      <span className="text-slate-400 px-1">24 Miles</span>
                      <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2 relative">
                        <ArrowRight className="h-4 w-4 absolute -top-2 left-1/2 -translate-x-1/2 text-slate-400 bg-white px-0.5" />
                      </div>
                      <span className="bg-[#BE123C] text-white px-2.5 py-1 rounded-md">Metro</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-white py-2 rounded-lg border border-slate-50">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Score</p>
                        <p className="text-xl font-bold text-blue-600">92</p>
                      </div>
                      <div className="text-center bg-white py-2 rounded-lg border border-slate-50">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Inventory</p>
                        <p className="text-xl font-bold text-slate-800">14%</p>
                      </div>
                      <div className="text-center bg-white py-2 rounded-lg border border-slate-50">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Distance</p>
                        <p className="text-xl font-bold text-slate-800">24<span className="text-sm font-normal text-slate-500">m</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donor Scheduling Widget (from doclink image) */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Select a slot</h3>
                  
                  <div className="flex gap-2 mb-4 bg-[#F4F7FB] p-1.5 rounded-xl border border-slate-100">
                    <button className="flex-1 text-center py-2 px-3 bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" /> 29/05/2026
                    </button>
                    <button className="flex-1 text-center py-2 px-3 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-200/50 transition-colors flex items-center justify-center gap-1">
                      Time zone <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-full py-2 rounded-lg text-xs font-bold bg-rose-50 text-[#BE123C] border border-rose-100 mb-4 shadow-sm">
                      Urgent Priority: O-Negative Needed
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">08:00 AM</button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm relative">
                        08:10 AM
                        <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-[#BE123C] border-[3px] border-white shadow-sm"></div>
                      </button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">08:20 AM</button>
                      
                      <button className="py-2.5 text-sm font-bold text-white bg-blue-500 border border-blue-500 rounded-xl shadow-[0_4px_10px_rgb(59,130,246,0.3)]">08:30 AM</button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">08:40 AM</button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">08:50 AM</button>
                      
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">09:00 AM</button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">09:10 AM</button>
                      <button className="py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">09:20 AM</button>
                    </div>
                    
                    <div className="text-center mt-4">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center justify-center gap-1 w-full">
                        See more <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center mb-5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Capacity Impact</span>
                    <span className="font-bold text-slate-900 text-lg">+1 Unit</span>
                  </div>
                  
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-[0_4px_12px_rgb(59,130,246,0.25)] flex items-center justify-center gap-2">
                    Confirm Schedule <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BloodLogisticsDashboard;
