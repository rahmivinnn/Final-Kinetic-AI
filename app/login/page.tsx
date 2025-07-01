import Image from "next/image"
import Link from "next/link"
import { User, Shield } from "lucide-react"

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#001a41] to-[#003366] p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image src="/kinetic-logo.png" alt="Kinetic Logo" width={100} height={100} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Kinetic</h1>
        <p className="text-xl text-white">Choose your login portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Patient Portal Card */}
        <Link
          href="/login/patient"
          className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 text-black p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border">
            <div className="flex items-center mb-4">
              <div className="bg-blue-200 p-3 rounded-full mr-4">
                <User className="h-6 w-6 text-blue-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Patient Access</h2>
                <p className="text-gray-700">
                  Access your personalized recovery plan and track your progress
                </p>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-2 text-black">For Patients</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• View your personalized exercise plans</li>
                <li>• Track your recovery progress</li>
                <li>• Schedule appointments with your therapist</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-600 text-white p-4 text-center">
            <span className="font-medium">Enter Patient Portal</span>
          </div>
        </Link>

        {/* Provider Portal Card */}
        <Link
          href="/login/provider"
          className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl"
        >
          <div className="bg-gradient-to-br from-green-100 to-teal-100 text-black p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border">
            <div className="flex items-center mb-4">
              <div className="bg-green-200 p-3 rounded-full mr-4">
                <Shield className="h-6 w-6 text-green-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Provider Access</h2>
                <p className="text-gray-700">
                  Manage your patients and monitor their recovery progress
                </p>
              </div>
            </div>
            <div className="mt-6 bg-green-50 p-4 rounded-lg border">
              <h3 className="font-medium text-black mb-2">For Healthcare Providers</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Manage patient treatment plans</li>
                <li>• Monitor patient progress and adherence</li>
                <li>• Schedule appointments and consultations</li>
              </ul>
            </div>
          </div>
          <div className="bg-green-600 text-white p-4 text-center">
            <span className="font-medium">Enter Provider Portal</span>
          </div>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-black hover:underline text-sm">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
