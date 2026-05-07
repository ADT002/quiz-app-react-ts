class PermissionService {
    static getPermissions(): string[] {
        try {
            return JSON.parse(localStorage.getItem('permission') || '[]');
        } catch (err) {
            return [];
        }
    }

    static has(permission: string): boolean {
        return this.getPermissions().includes(permission);
    }

    static hasAny(perms: string[]): boolean {
        const userPerms = this.getPermissions();
        return perms.some(p => userPerms.includes(p));
    }
}

export default PermissionService;
