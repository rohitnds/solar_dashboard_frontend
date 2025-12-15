import { apiPost } from "@/lib/api";
import useOrgStore from "@/store/useOrgStore";
import { useEffect, useState } from "react";

export default function OrgModal() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const { setOrg, org, getOrgInfo } = useOrgStore();

useEffect(() => {
  (async () => {
    await getOrgInfo();
  })();
}, []);


  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;

    setLoading(true);
    try {
      const res = await apiPost("/api/org/create-org", { org_name: orgName });
      setOrg(res.org);
      alert("Org created!");
      setShowCreateModal(false);
      setOrgName("");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  console.log(org);
  
  return (
    <>
      {/* MAIN MODAL */}
    {!org?.org_id && (
        <div className="h-screen flex items-center justify-center">
          {/* Backdrop (NOT closable) */}
          <div className=" bg-black/50" />

          <div className="relative bg-white rounded-2xl shadow-lg p-8 w-[600px] z-10">
            <h2 className="text-xl font-semibold mb-4">Choose an Option to Join</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Join Existing */}
              <button
                className="w-full rounded-xl border p-4 opacity-75 text-left hover:bg-gray-50 transition"
                disabled
              >
                <p className="font-medium">Join Existing Organization</p>
                <p className="text-sm text-gray-500">
                  Contact your organization admin to invite you.
                </p>
              </button>

              {/* Create New */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full rounded-xl border p-4 text-left hover:bg-gray-50 transition"
              >
                <p className="font-medium">Create New Organization</p>
                <p className="text-sm text-gray-500">
                  Create and manage your own organization.
                </p>
              </button>
            </div>

            {/* No close button */}
          </div>
        </div>
      )}

      {/* NESTED SMALL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop (NOT closable) */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative bg-white rounded-xl shadow-lg p-6 w-[350px] z-10">
            <h3 className="text-lg font-semibold mb-3">Create Organization</h3>

            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Organization name"
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateOrg}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
