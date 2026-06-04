import storage from './api/storage.js';
import { auth, onAuthStateChanged, db, collection, getDocs } from './api/firebase.js';

class AdminDashboard {
    constructor() {
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await this.loadStats();
                await this.loadRecentActivity();
            } else {
                console.log('Admin: User not logged in. Please login on the home page.');
                // Removed redirect to allow testing
                await this.loadStats(); 
            }
        });
    }

    async loadStats() {
        // Mocking some stats but fetching user count if possible
        const usersSnap = await getDocs(collection(db, 'users'));
        document.querySelector('.stat-value').textContent = usersSnap.size;
    }

    async loadRecentActivity() {
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
        const tbody = document.querySelector('tbody');
        
        if (reviewsSnap.size > 0) {
            tbody.innerHTML = reviewsSnap.docs.map(docSnap => {
                const data = docSnap.data();
                const id = docSnap.id;
                return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 1rem;">${data.userName}</td>
                        <td style="padding: 1rem;">${data.review.substring(0, 30)}...</td>
                        <td style="padding: 1rem;">ID: ${data.itemId}</td>
                        <td style="padding: 1rem;">
                            <button class="btn btn-secondary btn-sm delete-review" data-id="${id}" style="background: var(--primary-color); font-size: 0.6rem;">
                                <i class="fas fa-trash"></i> DELETE
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('.delete-review').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm('Delete this review permanently?')) {
                        await deleteDoc(doc(db, 'reviews', btn.dataset.id));
                        this.loadRecentActivity();
                    }
                };
            });
        }
    }
}

import { deleteDoc, doc } from './api/firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
