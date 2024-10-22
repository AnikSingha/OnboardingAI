import { Link } from 'react-router-dom';
import { Phone, BarChart2, Calendar, Settings } from 'lucide-react';

function HeroSection() {
    return (
      <section className="bg-[#F0F4F8] py-16 px-8 rounded-3xl mx-auto my-12 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div className="md:w-5/12 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3748] mb-6 leading-tight">
              Seamless and easy customer onboarding
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Respond to leads, organize contacts, and instantly generate client communications with OnboardAI
            </p>
            <Link to="/sign-up">
              <button className="px-8 py-3 text-lg font-medium text-white bg-[#6366F1] rounded-full hover:bg-[#5253CC] shadow-md transition duration-300">
                Start For Free
              </button>
            </Link>
          </div>
          <div className="md:w-6/12 bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#2D3748]">Dashboard</h2>
              <nav className="flex space-x-4">
                <NavItem icon={<Phone className="w-4 h-4" />} label="Calls" />
                <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
              </nav>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatBox
                title="Total Calls"
                value="1,234"
                change="+20.1% from last month"
                icon={<Phone className="w-5 h-5 text-blue-500" />}
              />
              <StatBox
                title="Success Rate"
                value="89%"
                change="+2.4% from last month"
                icon={<BarChart2 className="w-5 h-5 text-blue-500" />}
              />
              <StatBox
                title="Active Campaigns"
                value="3"
                change="2 campaigns ending soon"
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Recent Calls</h3>
              <div className="space-y-3">
                <RecentCall
                    name="John Doe"
                    time="2 minutes ago"
                    duration="3:24"
                  />
                  <RecentCall
                    name="Bobby Bill"
                    time="10 minutes ago"
                    duration="2:32"
                  />
                  <RecentCall
                    name="Drill Sergeant"
                    time="22 minutes ago"
                    duration="10:01"
                  />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

function StatBox({ title, value, change, icon }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xs font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <p className="text-xl font-bold text-[#2D3748] mb-1">{value}</p>
      <p className="text-xs text-blue-500">{change}</p>
    </div>
  );
}

function NavItem({ icon, label }) {
  return (
    <div className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer">
      {icon}
      <span className="ml-1 text-xs">{label}</span>
    </div>
  );
}

function RecentCall({ name, time, duration }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <div>
        <p className="font-medium text-sm text-[#2D3748]">{name}</p>
        <p className="text-xs text-gray-500">{time} • {duration} duration</p>
      </div>
      <Phone className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export default HeroSection;
