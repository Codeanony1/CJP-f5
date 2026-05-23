'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserVoices } from '@/lib/db'

interface UserData {
  id: string
  email: string
  full_name: string | null
  phone_number: string | null
  state: string | null
  district: string | null
  occupation: string | null
  age: number | null
  membership_status: string | null
  membership_date: string | null
}

interface Voice {
  id: string
  title: string
  content: string
  status: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    state: '',
    district: '',
    occupation: '',
    age: '',
  })

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setUserData(profileData as UserData)
        setFormData({
          full_name: profileData.full_name || '',
          phone_number: profileData.phone_number || '',
          state: profileData.state || '',
          district: profileData.district || '',
          occupation: profileData.occupation || '',
          age: profileData.age ? profileData.age.toString() : '',
        })
      }

      // Fetch user's voices
      const userVoices = await getUserVoices(user.id)
      setVoices(userVoices as Voice[])

      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          state: formData.state,
          district: formData.district,
          occupation: formData.occupation,
          age: formData.age ? parseInt(formData.age) : null,
        })
        .eq('id', user.id)

      if (error) {
        console.error('[v0] Error saving profile:', error)
      } else {
        setUserData({
          ...userData,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          state: formData.state,
          district: formData.district,
          occupation: formData.occupation,
          age: formData.age ? parseInt(formData.age) : null,
        } as UserData)
        setEditing(false)
      }
    } catch (err) {
      console.error('[v0] Unexpected error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading your profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">
            <span className="text-primary">My Profile</span>
          </h1>
          <p className="text-lg text-muted-foreground">Manage your CJP membership and view your contributions</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your CJP membership details</CardDescription>
              </div>
              <Button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                disabled={saving}
              >
                {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    name="age"
                    type="number"
                    min="13"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Occupation</label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select occupation</option>
                    <option value="Student">Student</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Homemaker">Homemaker</option>
                    <option value="Retired">Retired</option>
                    <option value="Looking for Work">Looking for Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State / Union Territory</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select state</option>
                    <optgroup label="States">
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </optgroup>
                    <optgroup label="Union Territories">
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Enter your district"
                  />
                </div>
              </div>

              {/* Membership Status */}
              <div className="border-t border-border pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Membership Status</label>
                    <p className="text-lg font-semibold text-primary">
                      {userData?.membership_status || 'PENDING'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-lg font-semibold">
                      {userData?.membership_date
                        ? new Date(userData.membership_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Voices */}
          <Card>
            <CardHeader>
              <CardTitle>My Voices</CardTitle>
              <CardDescription>Your submitted voices and demands</CardDescription>
            </CardHeader>
            <CardContent>
              {voices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven&apos;t shared any voices yet.</p>
                  <Link href="/voices/submit">
                    <Button>Share Your First Voice</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {voices.map((voice) => (
                    <div key={voice.id} className="border border-border p-4 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{voice.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(voice.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-foreground/90 line-clamp-2">{voice.content}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              voice.status === 'APPROVED'
                                ? 'bg-green-500/20 text-green-400'
                                : voice.status === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {voice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membership Card */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Generate Member Card</CardTitle>
              <CardDescription>Create a downloadable membership card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 mb-4">
                Generate a personalized member card that you can download and share.
              </p>
              <Link href="/profile/card">
                <Button>Generate My Card</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Your profile is part of the CJP community. Keep making your voice heard!
          </p>
        </div>
      </footer>
    </div>
  )
}
