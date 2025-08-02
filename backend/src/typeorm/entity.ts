import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('addons')
export class Addon {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    addon_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @Column({ type: 'int' })
    @Index()
    carrier_id: number;

    @Column({ type: 'varchar', length: 100 })
    addon_name: string;

    @Column({ type: 'int' })
    monthly_fee: number;

    @Column({ type: 'int' })
    req_duration: number;

    @Column({ type: 'int' })
    penalty_fee: number;

    @ManyToOne(() => Store, store => store.addons)
    store: Store;

    @ManyToOne(() => Carrier, carrier => carrier.addons)
    carrier: Carrier;
}

@Entity('carriers')
export class Carrier {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    carrier_id: number;

    @Column({ type: 'varchar', length: 50 })
    carrier_name: string;

    @OneToMany(() => Addon, addon => addon.carrier)
    addons: Addon[];

    @OneToMany(() => ReqPlan, reqPlan => reqPlan.carrier)
    reqPlans: ReqPlan[];
}

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    category_id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToMany(() => PostCategory, postCategory => postCategory.category)
    postCategories: PostCategory[];
}

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    comment_id: number;

    @Column({ type: 'bigint' })
    @Index()
    post_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @Column({ type: 'tinyint', default: 0 })
    is_deleted: boolean;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @ManyToOne(() => User, user => user.comments)
    user: User;
}

@Entity('phone_devices')
export class PhoneDevice {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    @Index()
    model_id: number;

    @Column({ type: 'int' })
    @Index()
    storage_id: number;

    @Column({ type: 'int' })
    retail_price: number;

    @Column({ type: 'int', nullable: true })
    unlocked_price: number;

    @Column({ type: 'text', nullable: true })
    coupang_link: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => PhoneModel, model => model.devices)
    model: PhoneModel;

    @ManyToOne(() => PhoneStorage, storage => storage.devices)
    storage: PhoneStorage;
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  offer_id!: number;

  @Column({ type: 'bigint' })
  store_id!: number;

  @Column({ type: 'int' })
  carrier_id!: number;

  @Column({ type: 'bigint' })
  device_id!: number;

  @Column({
    type: 'enum',
    enum: ['MNP', 'CHG'],
  })
  offer_type!: 'MNP' | 'CHG';

  @Column({ type: 'int' })
  price!: number;

  @CreateDateColumn()
  created_at!: Date;
}

@Entity('phone_manufacturers')
export class PhoneManufacturer {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 30 })
    name_ko: string;

    @Column({ type: 'varchar', length: 30, unique: true })
    name_en: string;

    @OneToMany(() => PhoneModel, model => model.manufacturer)
    models: PhoneModel[];
}

@Entity('phone_models')
export class PhoneModel {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'int' })
    @Index()
    manufacturer_id: number;

    @Column({ type: 'varchar', length: 50 })
    name_ko: string;

    @Column({ type: 'varchar', length: 50 })
    @Index()
    name_en: string;

    @Column({ type: 'varchar', length: 255 })
    image_url: string;

    @ManyToOne(() => PhoneManufacturer, manufacturer => manufacturer.models)
    manufacturer: PhoneManufacturer;

    @OneToMany(() => PhoneDevice, device => device.model)
    devices: PhoneDevice[];
}

@Entity('phone_storages')
export class PhoneStorage {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 10, unique: true })
    storage: string;

    @OneToMany(() => PhoneDevice, device => device.storage)
    devices: PhoneDevice[];
}

@Entity('post_categories')
export class PostCategory {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    post_id: number;

    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    category_id: number;

    @ManyToOne(() => Post, post => post.postCategories)
    post: Post;

    @ManyToOne(() => Category, category => category.postCategories)
    category: Category;
}

@Entity('post_files')
export class PostFile {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    file_id: number;

    @Column({ type: 'bigint' })
    @Index()
    post_id: number;

    @Column({ type: 'varchar', length: 255 })
    file_name: string;

    @Column({ type: 'text' })
    file_url: string;

    @Column({ type: 'int' })
    file_size: number;

    @CreateDateColumn()
    uploaded_at: Date;

    @ManyToOne(() => Post, post => post.files)
    post: Post;
}

@Entity('post_images')
export class PostImage {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    image_id: number;

    @Column({ type: 'bigint' })
    @Index()
    post_id: number;

    @Column({ type: 'text' })
    image_url: string;

    @CreateDateColumn()
    uploaded_at: Date;

    @ManyToOne(() => Post, post => post.images)
    post: Post;
}

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    post_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'int', default: 0 })
    view_count: number;

    @Column({ type: 'tinyint', default: 0 })
    is_deleted: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(() => PostFile, file => file.post)
    files: PostFile[];

    @OneToMany(() => PostImage, image => image.post)
    images: PostImage[];

    @OneToMany(() => PostCategory, postCategory => postCategory.post)
    postCategories: PostCategory[];
}

@Entity('regions')
export class Region {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    region_id: number;

    @Column({ type: 'int', nullable: true })
    parent_id: number;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @ManyToOne(() => Region, region => region.children)
    parent: Region;

    @OneToMany(() => Region, region => region.parent)
    children: Region[];

    @OneToMany(() => Store, store => store.region)
    stores: Store[];
}

@Entity('req_plans')
export class ReqPlan {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    req_plan_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @Column({ type: 'int' })
    @Index()
    carrier_id: number;

    @Column({ type: 'int' })
    monthly_fee: number;

    @ManyToOne(() => Store, store => store.reqPlans)
    store: Store;

    @ManyToOne(() => Carrier, carrier => carrier.reqPlans)
    carrier: Carrier;
}

@Entity('sellers')
export class Seller {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    seller_id: number;

    @Column({ type: 'bigint' })
    @Index()
    user_id: number;

    @Column({ type: 'bigint' })
    @Index()
    store_id: number;

    @ManyToOne(() => User, user => user.sellers)
    user: User;

    @ManyToOne(() => Store, store => store.sellers)
    store: Store;
}

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    store_id: number;

    @Column({ type: 'int' })
    @Index()
    region_id: number;

    @Column({ type: 'varchar', length: 255 })
    store_name: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    contact: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    owner: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Region, region => region.stores)
    region: Region;

    @OneToMany(() => Addon, addon => addon.store)
    addons: Addon[];

    @OneToMany(() => ReqPlan, reqPlan => reqPlan.store)
    reqPlans: ReqPlan[];

    @OneToMany(() => Seller, seller => seller.store)
    sellers: Seller[];
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    user_id: number;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_number: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'enum', enum: ['male', 'female'], nullable: true })
    gender: 'male' | 'female';

    @Column({ type: 'enum', enum: ['local', 'google', 'apple', 'naver', 'kakao'] })
    login_provider: 'local' | 'google' | 'apple' | 'naver' | 'kakao';

    @Column({ type: 'varchar', length: 255, nullable: true })
    provider_id: string;

    @Column({ type: 'enum', enum: ['user', 'seller', 'admin'] })
    role: 'user' | 'seller' | 'admin';

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Seller, seller => seller.user)
    sellers: Seller[];
}
