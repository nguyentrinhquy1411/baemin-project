export interface CreateUserResponse {
    id: string;
    last_name: string;
    first_name: string;
    username: string;
    email: string;
    phone: string;
    address: string;
    role: any;
    created_at: any;
    updated_at: any;
}

// User profile with nested user from Prisma query result
interface UserProfileWithUser {
    last_name: string | null;
    first_name: string | null;
    phone: string | null;
    address: string | null;
    users: {
        id: string;
        email: string;
        username: string | null;
        role: any;
        created_at: Date | null;
        updated_at: Date | null;
    };
}

export function mapToCreateUserResponse(user: UserProfileWithUser): CreateUserResponse {
    return {
        id: user.users.id,
        last_name: user.last_name || "",
        first_name: user.first_name || "",
        username: user.users.username || "",
        email: user.users.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.users.role,
        created_at: user.users.created_at || new Date(),
        updated_at: user.users.updated_at || new Date(),
    };
}